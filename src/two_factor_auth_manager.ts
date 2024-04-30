import { ResolvedTwoFactorAuthConfig, TwoFactorSecret } from './types.js'
import { randomInt } from 'node:crypto'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export class TwoFactorAuthManager {
  constructor(private config: ResolvedTwoFactorAuthConfig) {}

  /**
   * Generate a `Secret` to the given user information
   */
  async generateSecret(userInfo: string): Promise<TwoFactorSecret> {
    const secret = authenticator.generateSecret(this.config.numberOfSecretBytes)
    const uri = authenticator.keyuri(userInfo, this.config.issuer, secret)
    const qr = await QRCode.toDataURL(uri)

    return {
      secret,
      uri,
      qr,
    }
  }

  /**
   * Generate `n` recovery codes
   */
  generateRecoveryCodes(n = 16) {
    return Array.from({ length: n }, () => this.generateRecoveryCode(10))
  }

  /**
   * Verify if the OTP (One-Time password) is
   * valid to the user `secret`, or if the `recovery codes` includes the `otp`.
   */
  verifyToken(secret: string = '', token: string, recoveryCodes: string[] = []) {
    let isValid = false
    try {
      isValid = authenticator.verify({ token: token.toString(), secret })
    } finally {
      if (!isValid) {
        isValid = recoveryCodes.includes(token)
      }
    }

    return isValid
  }

  /**
   * Generate a new token from a secret string
   */
  generateToken(secret: string): string {
    return authenticator.generate(secret)
  }

  private generateRandomChar() {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const randomIndex = randomInt(0, charset.length)
    return charset[randomIndex]
  }

  private generateRecoveryCode(length: number) {
    let recoveryCode = ''

    for (let i = 0; i < length; i++) {
      recoveryCode += this.generateRandomChar()
    }

    const middleIndex = Math.floor(length / 2)
    recoveryCode = `${recoveryCode.substring(0, middleIndex)} ${recoveryCode.substring(middleIndex)}`

    return recoveryCode
  }
}
