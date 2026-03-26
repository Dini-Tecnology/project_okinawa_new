# ==============================================================================
# NOOWE Restaurant — ProGuard / R8 Configuration
# React Native 0.74 + Expo 51
# Package: com.okinawa.restaurant
# ==============================================================================

# ==============================================================================
# 1. REACT NATIVE CORE
# ==============================================================================

# Keep React Native framework classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# JSI (JavaScript Interface) — required for new architecture / TurboModules
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.animated.** { *; }
-keep class com.facebook.react.config.** { *; }

# ReactPackage implementations (all native modules)
-keep class * implements com.facebook.react.ReactPackage { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

# Hermes engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.react.hermes.** { *; }

# Flipper (debug only — stripped in release, but keep rule for safety)
-dontwarn com.facebook.flipper.**

# SoLoader
-keep class com.facebook.soloader.** { *; }

# FBJNI
-keep class com.facebook.jni.** { *; }

# ==============================================================================
# 2. EXPO MODULES
# ==============================================================================

# Expo core
-keep class expo.modules.** { *; }
-keep class com.expo.** { *; }
-keep class host.exp.exponent.** { *; }

# Expo modules core — keeps the module registry intact
-keep class expo.modules.core.** { *; }
-keep class * extends expo.modules.core.ExportedModule { *; }
-keep class * extends expo.modules.core.ViewManager { *; }

# expo-notifications
-keep class expo.modules.notifications.** { *; }

# expo-haptics
-keep class expo.modules.haptics.** { *; }

# expo-secure-store
-keep class expo.modules.securestore.** { *; }

# expo-router
-keep class expo.modules.router.** { *; }

# ==============================================================================
# 3. SOCKET.IO CLIENT
# ==============================================================================

-keep class io.socket.** { *; }
-keep class io.socket.client.** { *; }
-keep class io.socket.engineio.** { *; }
-keep class io.socket.parser.** { *; }
-dontwarn io.socket.**

# OkHttp (Socket.IO transport layer)
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# ==============================================================================
# 4. SENTRY REACT NATIVE
# ==============================================================================

-keep class io.sentry.** { *; }
-keep class io.sentry.android.** { *; }
-keep class io.sentry.react.** { *; }
-dontwarn io.sentry.**

# Keep source file names and line numbers for Sentry stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ==============================================================================
# 5. REACT NATIVE PAPER (Material Design)
# ==============================================================================

-keep class com.facebook.react.views.** { *; }
-keep class io.github.nickg.rn_paper.** { *; }
-dontwarn io.github.nickg.rn_paper.**

# react-native-vector-icons (dependency of Paper)
-keep class com.oblador.vectoricons.** { *; }

# react-native-safe-area-context
-keep class com.th3rdwave.safeareacontext.** { *; }

# react-native-screens
-keep class com.swmansion.rnscreens.** { *; }

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }

# ==============================================================================
# 6. STRIPE / PAYMENT SDKs
# ==============================================================================

-keep class com.stripe.** { *; }
-keep class com.stripe.android.** { *; }
-keep class com.reactnativestripesdk.** { *; }
-dontwarn com.stripe.**

# Keep Stripe model classes (Parcelable, Serializable)
-keep class com.stripe.android.model.** { *; }
-keepclassmembers class com.stripe.android.model.** {
    <fields>;
    <init>(...);
}

# ==============================================================================
# 7. FIREBASE MESSAGING (Push Notifications)
# ==============================================================================

-keep class com.google.firebase.** { *; }
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase Installations
-keep class com.google.firebase.installations.** { *; }

# FirebaseMessagingService implementations
-keep class * extends com.google.firebase.messaging.FirebaseMessagingService { *; }

# ==============================================================================
# 8. ENUMS, ANNOTATIONS, SERIALIZABLE
# ==============================================================================

# Keep all enums intact (required by many libraries)
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Parcelable
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}
-keepclassmembers class * implements android.os.Parcelable {
    public <init>(android.os.Parcel);
}

# ==============================================================================
# 9. STANDARD ANDROID KEEP RULES
# ==============================================================================

# Keep BuildConfig
-keep class com.okinawa.restaurant.BuildConfig { *; }

# Keep R class references
-keep class **.R$* { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep View constructors (used by layout inflation)
-keepclasseswithmembers class * {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep Activities, Services, BroadcastReceivers, ContentProviders
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.Application

# Keep custom Application class
-keep class com.okinawa.restaurant.MainApplication { *; }

# ==============================================================================
# 10. OBFUSCATION — DON'T WARN (Common RN Issues)
# ==============================================================================

# Common React Native false-positive warnings
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

# Kotlin metadata (many RN libraries include Kotlin)
-dontwarn kotlin.**
-dontwarn kotlinx.**

# JSR 305 annotations (used by many libraries)
-dontwarn javax.annotation.**
-dontwarn javax.inject.**

# Apache HTTP legacy (deprecated but referenced)
-dontwarn org.apache.http.**
-dontwarn android.net.http.**

# Conscrypt (security provider)
-dontwarn org.conscrypt.**

# BouncyCastle (referenced by OkHttp)
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# Missing annotations from support/appcompat
-dontwarn androidx.**

# ==============================================================================
# 11. OPTIMIZATION SETTINGS
# ==============================================================================

# Don't optimize — React Native relies on specific class/method signatures
-dontoptimize

# Don't preverify (not needed for Android)
-dontpreverify

# Keep line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable

# Keep generic signatures (used by TypeToken, Gson, etc.)
-keepattributes Signature

# ==============================================================================
# 12. ADDITIONAL LIBRARIES (used in NOOWE Restaurant)
# ==============================================================================

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# react-native-svg
-keep class com.horcrux.svg.** { *; }

# @react-native-community/netinfo
-keep class com.reactnativecommunity.netinfo.** { *; }

# Gson (if used by any native modules)
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
