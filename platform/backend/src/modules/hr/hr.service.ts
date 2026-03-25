import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { LeaveRequest, LeaveRequestStatus } from './entities/leave-request.entity';
import { Shift, StaffRole } from './entities/shift.entity';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);

  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
  ) {}

  async getAttendance(restaurantId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = { restaurant_id: restaurantId };

    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }

    const records = await this.attendanceRepository.find({
      where,
      relations: ['user'],
      order: { date: 'DESC', check_in: 'ASC' },
    });

    interface AttendanceGroupEntry {
      staff_id: string;
      staff_name: string;
      total_hours: number;
      days_worked: number;
      late_arrivals: number;
      early_departures: number;
      records: Attendance[];
    }

    // Group by user and calculate totals
    const grouped: Record<string, AttendanceGroupEntry> = records.reduce((acc: Record<string, AttendanceGroupEntry>, record: Attendance) => {
      const userId = record.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          staff_id: userId,
          staff_name: record.user?.full_name || 'Unknown',
          total_hours: 0,
          days_worked: 0,
          late_arrivals: 0,
          early_departures: 0,
          records: [],
        };
      }

      acc[userId].total_hours += Number(record.hours_worked || 0);
      acc[userId].days_worked += record.status === AttendanceStatus.PRESENT ? 1 : 0;
      acc[userId].late_arrivals += record.status === AttendanceStatus.LATE ? 1 : 0;
      acc[userId].early_departures += record.status === AttendanceStatus.HALF_DAY ? 1 : 0;
      acc[userId].records.push(record);

      return acc;
    }, {});

    return Object.values(grouped);
  }

  async checkIn(userId: string, restaurantId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const existing = await this.attendanceRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
        date: new Date(today) as unknown as Date,
      },
    });

    if (existing && existing.check_in) {
      throw new BadRequestException('Already checked in today');
    }

    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0];

    const attendance = this.attendanceRepository.create({
      user_id: userId,
      restaurant_id: restaurantId,
      date: new Date(today) as unknown as Date,
      check_in: checkInTime,
      status: AttendanceStatus.PRESENT,
    });

    await this.attendanceRepository.save(attendance);
    this.logger.log(`User ${userId} checked in at ${checkInTime}`);

    return attendance;
  }

  async checkOut(userId: string, restaurantId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await this.attendanceRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
        date: new Date(today) as unknown as Date,
      },
    });

    if (!attendance) {
      throw new NotFoundException('No check-in record found for today');
    }

    if (attendance.check_out) {
      throw new BadRequestException('Already checked out today');
    }

    const now = new Date();
    const checkOutTime = now.toTimeString().split(' ')[0];

    // Calculate hours worked
    const checkIn = new Date(`1970-01-01T${attendance.check_in}`);
    const checkOut = new Date(`1970-01-01T${checkOutTime}`);
    const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    attendance.check_out = checkOutTime;
    attendance.hours_worked = Math.round(hoursWorked * 100) / 100;

    await this.attendanceRepository.save(attendance);
    this.logger.log(`User ${userId} checked out at ${checkOutTime}. Hours worked: ${hoursWorked}`);

    return attendance;
  }

  async getLeaveRequests(
    restaurantId: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const where: Record<string, unknown> = { restaurant_id: restaurantId };
    if (status) {
      where.status = status;
    }

    const validLimit = Math.min(Math.max(1, limit), 100);
    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * validLimit;

    const [requests, total] = await this.leaveRequestRepository.findAndCount({
      where,
      relations: ['user', 'approver'],
      order: { created_at: 'DESC' },
      take: validLimit,
      skip,
    });

    return {
      data: requests,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async createLeaveRequest(userId: string, data: { restaurant_id: string; leave_type: string; start_date: string; end_date: string; reason?: string }) {
    const leaveRequest = this.leaveRequestRepository.create({
      user_id: userId,
      restaurant_id: data.restaurant_id,
      leave_type: data.leave_type as any,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      reason: data.reason,
      status: LeaveRequestStatus.PENDING,
    });

    await this.leaveRequestRepository.save(leaveRequest);
    this.logger.log(`Leave request created by user ${userId}`);

    return leaveRequest;
  }

  async updateLeaveRequest(
    id: string,
    status: LeaveRequestStatus,
    approvedBy: string,
    rejectionReason?: string,
  ) {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    leaveRequest.status = status;
    leaveRequest.approved_by = approvedBy;
    leaveRequest.approved_at = new Date();

    if (status === LeaveRequestStatus.REJECTED && rejectionReason) {
      leaveRequest.rejection_reason = rejectionReason;
    }

    await this.leaveRequestRepository.save(leaveRequest);
    this.logger.log(`Leave request ${id} updated to ${status}`);

    return leaveRequest;
  }

  /**
   * Update attendance record
   */
  async updateAttendance(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (updateAttendanceDto.check_out_time) {
      attendance.check_out = updateAttendanceDto.check_out_time;

      // Recalculate hours worked if both check_in and check_out are present
      if (attendance.check_in && attendance.check_out) {
        const checkIn = new Date(`1970-01-01T${attendance.check_in}`);
        const checkOut = new Date(`1970-01-01T${attendance.check_out}`);
        const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        attendance.hours_worked = Math.round(hoursWorked * 100) / 100;
      }
    }

    if (updateAttendanceDto.notes !== undefined) {
      attendance.notes = updateAttendanceDto.notes;
    }

    return this.attendanceRepository.save(attendance);
  }

  /**
   * Update shift
   */
  async updateShift(id: string, updateShiftDto: UpdateShiftDto) {
    const shift = await this.shiftRepository.findOne({
      where: { id },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (updateShiftDto.start_time !== undefined) {
      shift.start_time = updateShiftDto.start_time;
    }

    if (updateShiftDto.end_time !== undefined) {
      shift.end_time = updateShiftDto.end_time;
    }

    if (updateShiftDto.role !== undefined) {
      shift.role = updateShiftDto.role;
    }

    if (updateShiftDto.notes !== undefined) {
      shift.notes = updateShiftDto.notes;
    }

    return this.shiftRepository.save(shift);
  }

  async getShifts(
    restaurantId: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const validLimit = Math.min(Math.max(1, limit), 100);
    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * validLimit;

    const where: Record<string, unknown> = { restaurant_id: restaurantId };
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }

    const [shifts, total] = await this.shiftRepository.findAndCount({
      where,
      relations: ['user'],
      order: { date: 'DESC', start_time: 'ASC' },
      take: validLimit,
      skip,
    });

    return {
      data: shifts,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async createShift(data: Partial<Shift>) {
    const shift = this.shiftRepository.create(data);
    return this.shiftRepository.save(shift);
  }

  async deleteShift(id: string) {
    const shift = await this.shiftRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    await this.shiftRepository.remove(shift);
    return { message: 'Shift deleted successfully' };
  }
}
