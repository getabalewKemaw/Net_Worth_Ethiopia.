package expo.modules.smsinbox

import android.Manifest
import android.content.pm.PackageManager
import android.provider.Telephony
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSmsInboxModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSmsInbox")

    Function("isAvailable") {
      true
    }

    Function("hasSmsPermission") {
      val context = appContext.reactContext ?: return@Function false
      ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED
    }

    AsyncFunction("fetchBankSmsMessages") { limit: Int? ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context not available")

      val hasPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED

      if (!hasPermission) {
        throw SecurityException("READ_SMS permission is not granted")
      }

      val maxLimit = if (limit != null && limit > 0) limit else 200

      // Strict whitelist of addresses for Ethiopian banks and mobile money
      val bankSenders = listOf(
        "127", "telebirr", "Telebirr",
        "CBE", "CBEBirr", "cbebirr", "889", "829",
        "AWASH", "AwashBank", "Awash Bank", "awash",
        "BOA", "Abyssinia", "Bank of Abyssinia", "boa",
        "DashenBank", "Dashen", "Amole", "amole"
      )

      val inClause = bankSenders.joinToString(",") { "'$it'" }
      val selection = "${Telephony.Sms.ADDRESS} IN ($inClause)"
      val sortOrder = "${Telephony.Sms.DATE} DESC LIMIT $maxLimit"

      val projection = arrayOf(
        Telephony.Sms._ID,
        Telephony.Sms.ADDRESS,
        Telephony.Sms.BODY,
        Telephony.Sms.DATE
      )

      val results = mutableListOf<Map<String, Any>>()

      val cursor = context.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        projection,
        selection,
        null,
        sortOrder
      )

      cursor?.use {
        val idCol = it.getColumnIndexOrThrow(Telephony.Sms._ID)
        val addressCol = it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
        val bodyCol = it.getColumnIndexOrThrow(Telephony.Sms.BODY)
        val dateCol = it.getColumnIndexOrThrow(Telephony.Sms.DATE)

        while (it.moveToNext()) {
          val id = it.getString(idCol) ?: ""
          val address = it.getString(addressCol) ?: ""
          val body = it.getString(bodyCol) ?: ""
          val date = it.getLong(dateCol)

          results.add(
            mapOf(
              "id" to id,
              "address" to address,
              "body" to body,
              "date" to date.toDouble()
            )
          )
        }
      }

      return@AsyncFunction results
    }
  }
}
