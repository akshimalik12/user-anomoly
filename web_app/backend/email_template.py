"""
OTP Email Template for NeurometricShield MFA

This module contains the HTML template used when sending OTP verification
codes via email. Built with highly compatible tables for Gmail/Outlook rendering.
"""

def get_otp_email_html(otp: str, username: str = "User") -> str:
    """
    Returns a styled, heavily tested HTML email body for the OTP verification code.
    """
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NeurometricShield Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; margin: auto;">
          
          <tr>
            <td style="height: 4px; background-color: #3b82f6; border-top-left-radius: 8px; border-top-right-radius: 8px;"></td>
          </tr>

          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center;">
              <div style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 5px;">
                Neurometric<span style="color: #3b82f6;">Shield</span>
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">Security Verification Required</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #451a03; border: 1px solid #78350f; border-radius: 6px; padding: 15px;">
                    <p style="color: #fbbf24; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">
                      ⚠️ Unusual login activity was detected.
                    </p>
                    <p style="color: #d1d5db; font-size: 13px; margin: 0; line-height: 1.5;">
                      To verify your identity, please use the code below. If you did not attempt to log in, secure your account immediately.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 30px 10px 30px;">
              <p style="color: #e2e8f0; font-size: 16px; margin: 0;">
                Hello <strong style="color: #ffffff;">{username}</strong>,
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 30px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin: 0 0 15px 0;">
                      Your Verification Code
                    </p>
                    
                    <div style="font-size: 44px; font-weight: 800; color: #38bdf8; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; margin: 0;">
                      {otp}
                    </div>
                    
                    <p style="color: #64748b; font-size: 12px; margin: 15px 0 0 0;">
                      ⏱ This code expires in <strong style="color: #fbbf24;">10 minutes</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 30px 30px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #0f2942; border: 1px solid #1d4ed8; border-radius: 6px; padding: 15px;">
                    <p style="color: #60a5fa; font-size: 12px; font-weight: 700; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      🔒 Security Reminders
                    </p>
                    <ul style="color: #94a3b8; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
                      <li>Never share this code with anyone</li>
                      <li>NeurometricShield will never ask for your password via email</li>
                      <li>If you didn't request this code, change your password immediately</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 30px 30px 30px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="color: #475569; font-size: 12px; margin: 0; line-height: 1.5;">
                This is an automated security alert from <strong style="color: #64748b;">NeurometricShield</strong>.<br />
                Behavioral anomaly detection powered by AI ensemble analysis.
              </p>
              <p style="color: #334155; font-size: 11px; margin: 10px 0 0 0;">
                © 2026 NeurometricShield • UEBA Security Platform
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
"""

def get_otp_email_text(otp: str, username: str = "User") -> str:
    """
    Returns a plain-text version of the OTP email.
    """
    return f"""NeurometricShield - Security Verification

Hello {username},

Unusual login activity was detected on your account.
Your verification code is: {otp}

This code expires in 10 minutes.

SECURITY REMINDERS:
- Never share this code with anyone
- NeurometricShield will never ask for your password via email
- If you didn't request this code, change your password immediately

This is an automated security alert from NeurometricShield.
© 2026 NeurometricShield • UEBA Security Platform
"""

def get_brute_force_email_html(attempts: int, username: str = "User") -> str:
    """
    Returns a styled, heavily tested HTML email body for Brute Force Alerts.
    """
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NeurometricShield Critical Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f172a; border-radius: 8px; border: 1px solid #1e293b; margin: auto;">
          
          <tr>
            <td style="height: 4px; background-color: #ef4444; border-top-left-radius: 8px; border-top-right-radius: 8px;"></td>
          </tr>

          <tr>
            <td style="padding: 30px 30px 20px 30px; text-align: center;">
              <div style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 5px;">
                Neurometric<span style="color: #ef4444;">Shield</span>
              </div>
              <p style="color: #fca5a5; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Critical Security Alert</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #450a0a; border: 1px solid #7f1d1d; border-radius: 6px; padding: 15px;">
                    <p style="color: #f87171; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">
                      🚨 Brute Force Attack Detected
                    </p>
                    <p style="color: #fecaca; font-size: 13px; margin: 0; line-height: 1.5;">
                      Our anomaly detection engine has blocked multiple failed login attempts targeting your account. Immediate action may be required.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 30px 10px 30px;">
              <p style="color: #e2e8f0; font-size: 16px; margin: 0;">
                Hello <strong style="color: #ffffff;">{username}</strong>,
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 30px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin: 0 0 15px 0;">
                      Failed Login Attempts
                    </p>
                    
                    <div style="font-size: 44px; font-weight: 800; color: #ef4444; margin: 0;">
                      {attempts}
                    </div>
                    
                    <p style="color: #64748b; font-size: 13px; margin: 15px 0 0 0;">
                      Someone is trying to guess your password.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px 30px 30px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #0f2942; border: 1px solid #1d4ed8; border-radius: 6px; padding: 15px;">
                    <p style="color: #60a5fa; font-size: 12px; font-weight: 700; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      🛡️ Recommended Actions
                    </p>
                    <ul style="color: #94a3b8; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
                      <li>If this was not you, <strong style="color: #f87171;">reset your password immediately</strong>.</li>
                      <li>Ensure you are using a strong, unique password.</li>
                      <li>Enable Multi-Factor Authentication (MFA) if not already active.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 30px 30px 30px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="color: #475569; font-size: 12px; margin: 0; line-height: 1.5;">
                This is an automated security alert from <strong style="color: #64748b;">NeurometricShield</strong>.<br />
                Behavioral anomaly detection powered by AI ensemble analysis.
              </p>
              <p style="color: #334155; font-size: 11px; margin: 10px 0 0 0;">
                © 2026 NeurometricShield • UEBA Security Platform
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
"""

def get_brute_force_email_text(attempts: int, username: str = "User") -> str:
    """
    Returns a plain-text version of the Brute Force Alert email.
    """
    return f"""NeurometricShield - Critical Security Alert

Hello {username},

🚨 BRUTE FORCE ATTACK DETECTED

Our anomaly detection engine has blocked multiple failed login attempts targeting your account.

Failed Login Attempts: {attempts}

Someone is trying to guess your password. 

RECOMMENDED ACTIONS:
- If this was not you, reset your password immediately.
- Ensure you are using a strong, unique password.
- Enable Multi-Factor Authentication (MFA) if not already active.

This is an automated security alert from NeurometricShield.
© 2026 NeurometricShield • UEBA Security Platform
"""