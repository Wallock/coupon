'use client'

import { useState } from 'react'

// ==================== Types ====================
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

type TabType = 'coupon' | 'bee-calculator' | 'more'

interface TabItem {
  id: TabType
  label: string
  icon: string
}

const tabs: TabItem[] = [
  { id: 'coupon', label: 'แลกคูปอง', icon: '🎟️' },
  { id: 'bee-calculator', label: 'คำนวณบี้', icon: '🐝' },
  { id: 'more', label: 'เพิ่มเติม', icon: '✨' },
]

// ==================== Coupon Tab Component ====================
function CouponTab() {
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
      const fileResponse = await fetch('/coupons.txt')
      const text = await fileResponse.text()
      const couponCodes = text.split('\n').filter(line => line.trim() !== '')

      setTotalCoupons(couponCodes.length)

      const redemptionResults: RedemptionResult[] = []

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
        } catch {
          redemptionResults.push({
            couponCode: couponCode.trim(),
            success: false,
            errorCode: -1,
            errorMessage: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
          })
        }

        setResults([...redemptionResults])
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์')
    } finally {
      setIsProcessing(false)
      setCurrentCoupon('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-purple-500/30">
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

          {results.filter((r) => r.success).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg">😢 ไม่มีคูปองที่แลกสำเร็จ</p>
              <p className="text-sm mt-2">คูปองทั้งหมดอาจถูกใช้ไปแล้ว หรือหมดอายุ</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== Bee Calculator Data ====================
type PlayerType = 'free' | 'monthly'
type BoxType = '50' | '80' | '100'

interface BoxInfo {
  ruby: number
  price: number
  rubyPerBox: number
}

const boxData: Record<BoxType, BoxInfo> = {
  '50': { ruby: 50, price: 1000, rubyPerBox: 20 },
  '80': { ruby: 80, price: 4000, rubyPerBox: 50 },
  '100': { ruby: 100, price: 5000, rubyPerBox: 50 },
}

interface MapData {
  name: string
  goldPerRun: number
  expPerRun: number
  keyPerRun: number
}

const mapData: MapData[] = [
  { name: 'แผนที่ 1-5', goldPerRun: 800, expPerRun: 150, keyPerRun: 2 },
  { name: 'แผนที่ 6-10', goldPerRun: 1200, expPerRun: 250, keyPerRun: 3 },
  { name: 'แผนที่ 11-15', goldPerRun: 1800, expPerRun: 400, keyPerRun: 4 },
  { name: 'แผนที่ 15+', goldPerRun: 2500, expPerRun: 600, keyPerRun: 5 },
  { name: 'ฝันร้าย', goldPerRun: 4000, expPerRun: 1000, keyPerRun: 8 },
]

// ==================== Bee Calculator Tab Component ====================
function BeeCalculatorTab() {
  const [playerType, setPlayerType] = useState<PlayerType>('free')
  const [boxType, setBoxType] = useState<BoxType>('50')
  const [rubyAmount, setRubyAmount] = useState<string>('1000')
  const [selectedMap, setSelectedMap] = useState<number>(3)
  const [runsPerDay, setRunsPerDay] = useState<string>('100')

  const calculateResults = () => {
    const ruby = parseInt(rubyAmount) || 0
    const runs = parseInt(runsPerDay) || 0
    const box = boxData[boxType]
    const map = mapData[selectedMap]

    // คำนวณจำนวนกล่องที่ซื้อได้
    const boxCount = Math.floor(ruby / box.rubyPerBox)
    const totalKeys = boxCount * box.ruby

    // คำนวณรอบที่ฟาร์มได้
    const possibleRuns = Math.floor(totalKeys / map.keyPerRun)
    const actualRuns = Math.min(possibleRuns, runs)

    // คำนวณทองที่ได้
    const goldEarned = actualRuns * map.goldPerRun
    const expEarned = actualRuns * map.expPerRun

    // คำนวณต้นทุน (บี้ที่ใช้)
    const rubyUsed = boxCount * box.rubyPerBox
    const keysUsed = actualRuns * map.keyPerRun
    const keysRemaining = totalKeys - keysUsed

    // โบนัสรายเดือน 10%
    const bonusMultiplier = playerType === 'monthly' ? 1.1 : 1
    const finalGold = Math.floor(goldEarned * bonusMultiplier)
    const finalExp = Math.floor(expEarned * bonusMultiplier)

    // คำนวณมูลค่าทอง (สมมติ 1 ทอง = 0.1 รูบี้ เพื่อเปรียบเทียบ)
    const goldValueInRuby = finalGold * 0.001
    const profit = goldValueInRuby - rubyUsed

    return {
      boxCount,
      totalKeys,
      possibleRuns,
      actualRuns,
      keysUsed,
      keysRemaining,
      rubyUsed,
      goldEarned: finalGold,
      expEarned: finalExp,
      profit,
      isProfit: profit >= 0,
    }
  }

  const results = calculateResults()

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-yellow-500/30">
        <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          🐝 ตั้งค่าการคำนวณบี้
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ประเภทผู้เล่น
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPlayerType('free')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  playerType === 'free'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                }`}
              >
                🆓 สายฟรี
              </button>
              <button
                onClick={() => setPlayerType('monthly')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  playerType === 'monthly'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                }`}
              >
                💎 รายเดือน (+10%)
              </button>
            </div>
          </div>

          {/* Box Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              กล่องบี้
            </label>
            <div className="flex gap-2">
              {(['50', '80', '100'] as BoxType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setBoxType(type)}
                  className={`flex-1 py-3 px-3 rounded-lg font-medium transition-all text-sm ${
                    boxType === type
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                      : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {type} บี้
                </button>
              ))}
            </div>
          </div>

          {/* Ruby Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              จำนวนรูบี้ที่มี
            </label>
            <input
              type="number"
              value={rubyAmount}
              onChange={(e) => setRubyAmount(e.target.value)}
              placeholder="1000"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* Runs Per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              จำนวนรอบฟาร์ม/วัน
            </label>
            <input
              type="number"
              value={runsPerDay}
              onChange={(e) => setRunsPerDay(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Map Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            เลือกแผนที่ฟาร์ม
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {mapData.map((map, index) => (
              <button
                key={index}
                onClick={() => setSelectedMap(index)}
                className={`py-3 px-3 rounded-lg font-medium transition-all text-sm ${
                  selectedMap === index
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {map.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-yellow-500/30">
        <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          📊 ผลการคำนวณ
        </h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-yellow-400">{results.boxCount}</div>
            <div className="text-xs text-gray-400 mt-1">กล่องที่ซื้อได้</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-400">{results.totalKeys.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">กุญแจทั้งหมด</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-purple-400">{results.actualRuns}</div>
            <div className="text-xs text-gray-400 mt-1">รอบที่ฟาร์มได้</div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-xl text-center">
            <div className="text-2xl font-bold text-cyan-400">{results.keysRemaining.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">กุญแจเหลือ</div>
          </div>
        </div>

        {/* Earnings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">💰 ทองที่ได้รับ</span>
              <span className="text-2xl font-bold text-yellow-400">
                {results.goldEarned.toLocaleString()}
              </span>
            </div>
            {playerType === 'monthly' && (
              <div className="text-xs text-green-400 mt-1 text-right">
                รวมโบนัส 10% แล้ว
              </div>
            )}
          </div>
          <div className="p-5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">⭐ EXP ที่ได้รับ</span>
              <span className="text-2xl font-bold text-blue-400">
                {results.expEarned.toLocaleString()}
              </span>
            </div>
            {playerType === 'monthly' && (
              <div className="text-xs text-green-400 mt-1 text-right">
                รวมโบนัส 10% แล้ว
              </div>
            )}
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="p-5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">💎 สรุปการใช้รูบี้</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">รูบี้ที่ใช้ซื้อกล่อง:</span>
              <span className="text-white">{results.rubyUsed.toLocaleString()} รูบี้</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">กุญแจที่ใช้:</span>
              <span className="text-white">{results.keysUsed.toLocaleString()} กุญแจ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">แผนที่:</span>
              <span className="text-white">{mapData[selectedMap].name}</span>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
          <p className="text-xs text-gray-400 text-center">
            💡 ข้อมูลอ้างอิงจาก Sheet การฟาร์มเด็ก - ผลลัพธ์อาจแตกต่างตามการตั้งค่าในเกมจริง
          </p>
        </div>
      </div>
    </div>
  )
}

// ==================== More Tab Component ====================
function MoreTab() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-cyan-500/30">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          ฟีเจอร์เพิ่มเติม
        </h2>
        <p className="text-gray-400 mb-6">ฟีเจอร์อื่นๆ ที่จะมาในอนาคต</p>
        <div className="inline-block px-4 py-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
          <span className="text-cyan-300 text-sm">🚧 Coming Soon - กำลังพัฒนา</span>
        </div>
      </div>
    </div>
  )
}

// ==================== Main Component ====================
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('coupon')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'coupon':
        return <CouponTab />
      case 'bee-calculator':
        return <BeeCalculatorTab />
      case 'more':
        return <MoreTab />
      default:
        return <CouponTab />
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

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            7K-Tools
          </h1>
          <p className="text-gray-400 mb-1">เครื่องมือสำหรับ Seven Knights</p>
          <p className="text-gray-500 text-xs">Last Updated: 22 January 2026</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-purple-500/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

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
