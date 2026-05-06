package expo.modules.dndcontroller

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DndControllerModule : Module() {
  private val notificationManager: NotificationManager?
    get() = appContext.reactContext?.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

  override fun definition() = ModuleDefinition {
    Name("DndController")

    Function("isAvailable") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
    }

    Function("hasPolicyAccess") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
        notificationManager?.isNotificationPolicyAccessGranted == true
    }

    Function("openPolicyAccessSettings") {
      val context = appContext.reactContext ?: return@Function false
      val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      true
    }

    Function("enableDnd") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        return@Function false
      }

      val manager = notificationManager ?: return@Function false
      if (!manager.isNotificationPolicyAccessGranted) {
        return@Function false
      }

      manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
      true
    }

    Function("disableDnd") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        return@Function false
      }

      val manager = notificationManager ?: return@Function false
      if (!manager.isNotificationPolicyAccessGranted) {
        return@Function false
      }

      manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
      true
    }
  }
}
