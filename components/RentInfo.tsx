'use client'

// แสดงค่าเช่ารายเดือน + เครื่องคำนวณ "เงินที่ต้องเตรียมวันเข้าอยู่"
export default function RentInfo({ listing }: { listing: any }) {
  const rent = Number(listing.rent_monthly) || 0
  const depMonths = Number(listing.deposit_months) || 0
  const common = Number(listing.common_fee) || 0
  const water = listing.water_rate
  const electric = listing.electric_rate

  const deposit = rent * depMonths          // เงินมัดจำ
  const advance = rent                       // ค่าเช่าล่วงหน้า 1 เดือน
  const upfront = deposit + advance + common // เงินเข้าอยู่วันแรก
  const monthly = rent + common              // ค่าใช้จ่ายรายเดือน (ยังไม่รวมน้ำ/ไฟตามใช้จริง)

  const baht = (n: number) => '฿' + n.toLocaleString()

  const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
    <div className={`flex justify-between ${strong ? 'font-bold text-gray-800 border-t border-orange-200 pt-2 mt-1' : 'text-gray-600'}`}>
      <span>{label}</span><span className={strong ? 'text-orange-600' : ''}>{value}</span>
    </div>
  )

  return (
    <div className="mb-4">
      <div className="bg-orange-50 rounded-xl p-4 mb-3">
        <p className="text-3xl font-bold text-orange-500">
          {baht(rent)}<span className="text-lg font-normal text-gray-400"> / เดือน</span>
        </p>
        {common > 0 && <p className="text-sm text-gray-500 mt-1">+ ค่าส่วนกลาง {baht(common)}/เดือน</p>}
      </div>

      {/* เครื่องคำนวณเงินเข้าอยู่ */}
      <div className="bg-white border border-orange-200 rounded-xl p-4">
        <p className="font-semibold text-gray-800 mb-2 flex items-center gap-1">💰 เงินที่ต้องเตรียมวันเข้าอยู่</p>
        <div className="space-y-1.5 text-sm">
          <Row label={`มัดจำ (${depMonths} เดือน)`} value={baht(deposit)}/>
          <Row label="ค่าเช่าล่วงหน้า (1 เดือน)" value={baht(advance)}/>
          {common > 0 && <Row label="ค่าส่วนกลาง (เดือนแรก)" value={baht(common)}/>}
          <Row label="รวมต้องเตรียม" value={baht(upfront)} strong/>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">หลังจากนั้นรายเดือน ≈ {baht(monthly)} + ค่าน้ำ/ไฟตามใช้จริง</p>
          <div className="flex gap-4">
            {water != null && water !== '' && <span>💧 ค่าน้ำ {baht(Number(water))}/หน่วย</span>}
            {electric != null && electric !== '' && <span>⚡ ค่าไฟ {baht(Number(electric))}/หน่วย</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
