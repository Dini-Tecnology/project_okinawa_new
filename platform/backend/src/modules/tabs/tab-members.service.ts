import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tab, TabMember } from './entities';
import { TabType, TabMemberRole, TabMemberStatus, TabStatus } from '@/common/enums';
import { JoinTabDto } from './dto';

@Injectable()
export class TabMembersService {
  constructor(
    @InjectRepository(Tab)
    private tabRepository: Repository<Tab>,
    @InjectRepository(TabMember)
    private tabMemberRepository: Repository<TabMember>,
  ) {}

  /**
   * Join an existing group tab
   */
  async joinTab(userId: string, dto: JoinTabDto): Promise<TabMember> {
    const tab = await this.tabRepository.findOne({
      where: { invite_token: dto.invite_token, status: TabStatus.OPEN },
      relations: ['members'],
    });

    if (!tab) {
      throw new NotFoundException('Tab not found or already closed');
    }

    if (tab.type !== TabType.GROUP) {
      throw new BadRequestException('Cannot join an individual tab');
    }

    // Check if already a member
    const existingMember = tab.members.find(m => m.user_id === userId);
    if (existingMember) {
      if (existingMember.status === TabMemberStatus.ACTIVE) {
        throw new BadRequestException('Already a member of this tab');
      }
      // Rejoin if left
      existingMember.status = TabMemberStatus.ACTIVE;
      existingMember.left_at = null as unknown as Date;
      return this.tabMemberRepository.save(existingMember);
    }

    // Check max members (could be configured per restaurant)
    const MAX_MEMBERS = 10;
    const activeMembers = tab.members.filter(m => m.status === TabMemberStatus.ACTIVE);
    if (activeMembers.length >= MAX_MEMBERS) {
      throw new BadRequestException('Tab has reached maximum number of members');
    }

    const member = this.tabMemberRepository.create({
      tab_id: tab.id,
      user_id: userId,
      role: TabMemberRole.MEMBER,
      status: TabMemberStatus.ACTIVE,
      credit_contribution: dto.credit_contribution || 0,
    });

    // Update tab credits
    if (dto.credit_contribution) {
      tab.cover_charge_credit = Number(tab.cover_charge_credit) + dto.credit_contribution;
      await this.tabRepository.save(tab);
    }

    return this.tabMemberRepository.save(member);
  }

  /**
   * Leave a tab
   */
  async leaveTab(tab: Tab, userId: string): Promise<void> {
    const member = tab.members.find(m => m.user_id === userId);

    if (!member) {
      throw new NotFoundException('You are not a member of this tab');
    }

    if (member.role === TabMemberRole.HOST) {
      throw new BadRequestException('Host cannot leave the tab. Close it instead.');
    }

    // Check if member has unpaid consumption
    if (member.amount_consumed > member.amount_paid) {
      throw new BadRequestException('You must pay your consumption before leaving');
    }

    member.status = TabMemberStatus.LEFT;
    member.left_at = new Date();
    await this.tabMemberRepository.save(member);
  }

  /**
   * Remove a member from tab (host only)
   */
  async removeMember(tab: Tab, hostUserId: string, memberUserId: string): Promise<void> {
    // Verify host
    const host = tab.members.find(m => m.user_id === hostUserId && m.role === TabMemberRole.HOST);
    if (!host) {
      throw new ForbiddenException('Only the host can remove members');
    }

    const member = tab.members.find(m => m.user_id === memberUserId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === TabMemberRole.HOST) {
      throw new BadRequestException('Cannot remove the host');
    }

    // Check if member has unpaid consumption
    if (member.amount_consumed > member.amount_paid) {
      throw new BadRequestException('Member must pay their consumption before being removed');
    }

    member.status = TabMemberStatus.REMOVED;
    member.left_at = new Date();
    await this.tabMemberRepository.save(member);
  }
}
