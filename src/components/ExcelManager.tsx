import React, { useRef } from 'react'
import { read, utils, writeFile } from 'xlsx'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileXls, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import type { LowerThirdData, ScheduleItem, SocialMessage } from '@/components/StreamOverlay'

interface ExcelManagerProps {
  onLowerThirdsListChange: (list: LowerThirdData[]) => void
  onScheduleListChange: (list: ScheduleItem[]) => void
  onSocialMessagesChange: (list: SocialMessage[]) => void
}

export function ExcelManager({
  onLowerThirdsListChange,
  onScheduleListChange,
  onSocialMessagesChange
}: ExcelManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    // 1. Előadók munkalap
    const eloadokData = [
      { 'Név': 'Dr. Példa János', 'Titulus': 'Egyetemi Tanár' },
      { 'Név': 'Kovács Anna', 'Titulus': 'HÖK Elnök' }
    ]
    const wsEloadok = utils.json_to_sheet(eloadokData)

    // 2. Menetrend munkalap
    const menetrendData = [
      { 'Időpont': '14:00', 'Előadó': 'Kovács Anna', 'Cím': 'Megnyitó beszéd' },
      { 'Időpont': '14:30', 'Előadó': 'Dr. Példa János', 'Cím': 'Mesterséges Intelligencia az oktatásban' }
    ]
    const wsMenetrend = utils.json_to_sheet(menetrendData)

    // 3. Közösségi munkalap
    const kozossegiData = [
      { 'Üzenet': '#ObudaEgyetem' },
      { 'Üzenet': 'Kövess minket Instagramon: @obudai_egyetem' },
      { 'Üzenet': 'Kérdezz a Slido-n: #OE2026' }
    ]
    const wsKozossegi = utils.json_to_sheet(kozossegiData)

    const wb = utils.book_new()
    utils.book_append_sheet(wb, wsEloadok, 'Eloadok')
    utils.book_append_sheet(wb, wsMenetrend, 'Menetrend')
    utils.book_append_sheet(wb, wsKozossegi, 'Kozossegi')

    writeFile(wb, 'OE_Stream_Sablon.xlsx')
    toast.success('Sablon letöltve!')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = read(bstr, { type: 'binary' })

        // Előadók beolvasása
        if (wb.SheetNames.includes('Eloadok')) {
          const ws = wb.Sheets['Eloadok']
          const data = utils.sheet_to_json<any>(ws)
          const newList: LowerThirdData[] = data
            .filter(row => row['Név'])
            .map(row => ({
              id: Math.random().toString(36).substring(2, 9),
              name: String(row['Név']),
              title: row['Titulus'] ? String(row['Titulus']) : ''
            }))
          onLowerThirdsListChange(newList)
        }

        // Menetrend beolvasása
        if (wb.SheetNames.includes('Menetrend')) {
          const ws = wb.Sheets['Menetrend']
          const data = utils.sheet_to_json<any>(ws)
          const newList: ScheduleItem[] = data
            .filter(row => row['Időpont'] && row['Cím'])
            .map(row => ({
              id: Math.random().toString(36).substring(2, 9),
              time: String(row['Időpont']),
              speaker: row['Előadó'] ? String(row['Előadó']) : '',
              title: String(row['Cím'])
            }))
          onScheduleListChange(newList)
        }

        // Közösségi beolvasása
        if (wb.SheetNames.includes('Kozossegi')) {
          const ws = wb.Sheets['Kozossegi']
          const data = utils.sheet_to_json<any>(ws)
          const newList: SocialMessage[] = data
            .filter(row => row['Üzenet'])
            .map(row => ({
              id: Math.random().toString(36).substring(2, 9),
              text: String(row['Üzenet'])
            }))
          onSocialMessagesChange(newList)
        }

        toast.success('Adatok sikeresen beimportálva!')
      } catch (err) {
        console.error(err)
        toast.error('Hiba történt a fájl beolvasásakor. Győződj meg róla, hogy a letöltött sablont használtad!')
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <Card className="p-4 sm:p-6 border-l-4 border-l-green-600 bg-green-500/5">
      <div className="mb-4 flex items-center gap-2">
        <FileXls size={24} weight="bold" className="text-green-600" />
        <h2 className="text-xl font-bold">Tömeges Adatkezelés (Excel)</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Töltsd le a sablont, töltsd ki az előadókkal és a menetrenddel, majd importáld be egy gombnyomással.
        Figyelem: az importálás <strong>felülírja</strong> az eddig felvett adatokat!
      </p>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Button 
          variant="outline" 
          className="border-green-600/30 hover:bg-green-600/10 hover:text-green-600 font-bold"
          onClick={handleDownloadTemplate}
        >
          <DownloadSimple size={20} className="mr-2" />
          Sablon Letöltése
        </Button>
        
        <div>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 font-bold text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadSimple size={20} className="mr-2" />
            Adatok Importálása
          </Button>
        </div>
      </div>
    </Card>
  )
}
