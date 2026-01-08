'use client'

import { useState } from 'react'

interface RedemptionResult {
  couponCode: string
  success: boolean
  errorCode: number
  errorMessage: string
  rewardType?: string
  resultData?: Array<{
    productName: string
    productImageUrl: string
    userSelectionRate: number
  }>
  confirmed?: boolean
  confirmErrorCode?: number
  confirmErrorMessage?: string
  confirmResultData?: Array<{
    quantity: number
  }>
}

export default function Home() {
  const [uid, setUid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<RedemptionResult[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  const [totalCoupons, setTotalCoupons] = useState(0)
  const [currentCoupon, setCurrentCoupon] = useState('')

  const handleStart = async () => {
    if (!uid.trim()) {
      alert('กรุณากรอก UID')
      return
    }

    setIsProcessing(true)
    setResults([])
    setCurrentProgress(0)

    try {
      // Read coupons.txt from server
      const fileResponse = await fetch('/coupons.txt')
      const text = await fileResponse.text()
      const couponCodes = text.split('\n').filter(line => line.trim() !== '')

      setTotalCoupons(couponCodes.length)

      const redemptionResults: RedemptionResult[] = []

      // Loop through each coupon code
      for (let i = 0; i < couponCodes.length; i++) {
        const couponCode = couponCodes[i]
        setCurrentCoupon(couponCode.trim())
        setCurrentProgress(i + 1)

        try {
          const response = await fetch('/api/redeem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pid: uid.trim(),
              couponCode: couponCode.trim(),
            }),
          })

          const data = await response.json()

          redemptionResults.push({
            couponCode: couponCode.trim(),
            success: data.success || false,
            errorCode: data.errorCode,
            errorMessage: data.errorMessage,
            rewardType: data.rewardType,
            resultData: data.resultData,
          })
        } catch (error) {
          redemptionResults.push({
            couponCode: couponCode.trim(),
            success: false,
            errorCode: -1,
            errorMessage: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
          })
        }

        // Update results in real-time
        setResults([...redemptionResults])
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์')
    } finally {
      setIsProcessing(false)
      setCurrentCoupon('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Banner */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="https://sgimage.netmarble.com/images/netmarble/tskgb/20250430/pnp71745980297126.jpg"
            alt="Seven Knights Banner"
            className="w-full h-auto"
          />
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 mb-8 border border-purple-500/30">
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            7K-AutoCoupon
          </h1>
          <p className="text-center text-gray-400 mb-1">ระบบแลกคูปองอัตโนมัติ Seven Knights</p>
          <p className="text-center text-gray-500 text-xs mb-8">Last Updated: 8 January 2026</p>

          <div className="space-y-6">
            <div>
              <label htmlFor="uid" className="block text-sm font-medium text-gray-300 mb-2">
                Player ID (UID)
              </label>
              <input
                id="uid"
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="กรอก UID ของคุณที่นี่..."
                className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                disabled={isProcessing}
              />
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>กำลังประมวลผล: {currentCoupon}</span>
                  <span>{currentProgress} / {totalCoupons}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentProgress / totalCoupons) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:shadow-none"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังประมวลผล...
                </span>
              ) : (
                '🚀 เริ่มแลกคูปอง'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-purple-500/30">
            {/* Summary */}
            <div className="mb-6 p-5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
              <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                📊 สรุปผลการแลก
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">
                    {results.filter((r) => r.success).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">สำเร็จ ✅</div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-3xl font-bold text-red-400">
                    {results.filter((r) => !r.success).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ไม่สำเร็จ ❌</div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400">
                    {results.filter((r) => r.confirmed).length}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">รับของแล้ว ✓</div>
                </div>
              </div>
            </div>

            {/* Success List Only */}
            {results.filter((r) => r.success).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  🎁 รางวัลที่ได้รับ ({results.filter((r) => r.success).length})
                </h3>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                  {results.filter((r) => r.success).map((result, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 hover:border-green-400/50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          <p className="font-semibold text-white text-sm">
                            {result.couponCode}
                          </p>
                        </div>
                        {result.confirmed && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                            ✓ รับแล้ว
                          </span>
                        )}
                      </div>
                      {result.resultData && result.resultData.length > 0 && (
                        <div className="ml-7 text-sm text-purple-200">
                          {result.resultData.map((r, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span>•</span>
                              <span>{r.productName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No success message */}
            {results.filter((r) => r.success).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg">😢 ไม่มีคูปองที่แลกสำเร็จ</p>
                <p className="text-sm mt-2">คูปองทั้งหมดอาจถูกใช้ไปแล้ว หรือหมดอายุ</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Credit */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Made with 💜 by <span className="text-purple-400 font-semibold">Wallock</span>
          </p>
        </div>
      </div>
    </div>
  )
}
