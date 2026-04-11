import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font, renderToBuffer,
} from '@react-pdf/renderer'
import path from 'path'

Font.register({
  family: 'Cairo',
  src: path.join(process.cwd(), 'public/fonts/Cairo.ttf'),
})

const s = StyleSheet.create({
  page:       { fontFamily: 'Cairo', backgroundColor: '#f7f8fa', padding: 0 },
  header:     { backgroundColor: '#0e1117', padding: '28 36', marginBottom: 0 },
  headerTitle:{ fontSize: 22, color: 'white', fontWeight: 'bold', textAlign: 'right' },
  headerSub:  { fontSize: 11, color: '#7ec8f5', textAlign: 'right', marginTop: 4 },
  headerEn:   { fontSize: 10, color: '#555', textAlign: 'left', marginTop: 2 },
  body:       { padding: '24 36' },
  section:    { backgroundColor: 'white', borderRadius: 10, padding: '18 20', marginBottom: 14, border: '1 solid #ebebea' },
  sectionTitleAr: { fontSize: 13, fontWeight: 'bold', color: '#111', textAlign: 'right', marginBottom: 10 },
  sectionTitleEn: { fontSize: 10, color: '#aaa', textAlign: 'left', marginBottom: 10 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  labelAr:    { fontSize: 11, color: '#666', textAlign: 'right' },
  valueAr:    { fontSize: 11, fontWeight: 'bold', color: '#111', textAlign: 'right' },
  labelEn:    { fontSize: 10, color: '#999', textAlign: 'left' },
  valueEn:    { fontSize: 10, color: '#333', textAlign: 'left' },
  divider:    { borderBottom: '1 solid #f0f0ee', marginVertical: 8 },
  statGrid:   { flexDirection: 'row', gap: 10, marginTop: 4 },
  statBox:    { flex: 1, backgroundColor: '#f5f5f3', borderRadius: 8, padding: '12 10', alignItems: 'center' },
  statNum:    { fontSize: 20, fontWeight: 'bold', color: '#378ADD', textAlign: 'center' },
  statLabelAr:{ fontSize: 9, color: '#888', textAlign: 'center', marginTop: 2 },
  statLabelEn:{ fontSize: 8, color: '#bbb', textAlign: 'center' },
  badge:      { backgroundColor: '#dcfce7', borderRadius: 4, padding: '3 8', alignSelf: 'flex-end' },
  badgeText:  { fontSize: 9, color: '#16a34a' },
  footer:     { backgroundColor: '#0e1117', padding: '14 36', marginTop: 'auto' },
  footerText: { fontSize: 9, color: '#555', textAlign: 'center' },
  screenRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '6 0', borderBottom: '1 solid #f5f5f3' },
})

interface CampaignReportData {
  clientName: string
  campaignName: string
  startDate: string
  endDate: string
  plays: number
  hours: number
  screensCount: number
  screens: { name: string; location_name?: string }[]
  mediaCount: number
  price?: number
}

function CampaignReport({ data }: { data: CampaignReportData }) {
  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  const todayEn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>تقرير أداء الحملة الإعلانية</Text>
          <Text style={s.headerEn}>Campaign Performance Report</Text>
          <Text style={[s.headerSub, { marginTop: 8 }]}>Shelfy Screens · shelfyscreens.com</Text>
        </View>

        <View style={s.body}>

          {/* Campaign Info */}
          <View style={s.section}>
            <Text style={s.sectionTitleAr}>بيانات الحملة / Campaign Details</Text>
            <View style={s.divider} />

            <View style={s.row}>
              <Text style={s.labelEn}>Client</Text>
              <Text style={s.labelAr}>العميل</Text>
            </View>
            <View style={s.row}>
              <Text style={s.valueEn}>{data.clientName}</Text>
              <Text style={s.valueAr}>{data.clientName}</Text>
            </View>

            <View style={[s.divider, { marginTop: 6 }]} />

            <View style={s.row}>
              <Text style={s.labelEn}>Campaign Name</Text>
              <Text style={s.labelAr}>اسم الحملة</Text>
            </View>
            <View style={s.row}>
              <Text style={s.valueEn}>{data.campaignName}</Text>
              <Text style={s.valueAr}>{data.campaignName}</Text>
            </View>

            <View style={[s.divider, { marginTop: 6 }]} />

            <View style={s.row}>
              <Text style={s.labelEn}>Duration</Text>
              <Text style={s.labelAr}>مدة الحملة</Text>
            </View>
            <View style={s.row}>
              <Text style={s.valueEn}>{data.startDate} — {data.endDate}</Text>
              <Text style={s.valueAr}>{data.startDate} — {data.endDate}</Text>
            </View>

            {data.price && data.price > 0 && (
              <>
                <View style={[s.divider, { marginTop: 6 }]} />
                <View style={s.row}>
                  <Text style={s.labelEn}>Value</Text>
                  <Text style={s.labelAr}>قيمة الحملة</Text>
                </View>
                <View style={s.row}>
                  <Text style={s.valueEn}>{data.price.toLocaleString()} SAR</Text>
                  <Text style={s.valueAr}>{data.price.toLocaleString()} ر.س</Text>
                </View>
              </>
            )}
          </View>

          {/* Stats */}
          <View style={s.section}>
            <Text style={s.sectionTitleAr}>إحصائيات الأداء / Performance Stats</Text>
            <View style={s.statGrid}>
              <View style={s.statBox}>
                <Text style={s.statNum}>{data.plays.toLocaleString()}</Text>
                <Text style={s.statLabelAr}>مرة عرض</Text>
                <Text style={s.statLabelEn}>Total Plays</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statNum}>{data.hours}</Text>
                <Text style={s.statLabelAr}>ساعة بث</Text>
                <Text style={s.statLabelEn}>Hours On Air</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statNum}>{data.screensCount}</Text>
                <Text style={s.statLabelAr}>شاشة</Text>
                <Text style={s.statLabelEn}>Screens</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statNum}>{data.mediaCount}</Text>
                <Text style={s.statLabelAr}>ملف محتوى</Text>
                <Text style={s.statLabelEn}>Media Files</Text>
              </View>
            </View>
          </View>

          {/* Screens */}
          {data.screens.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitleAr}>الشاشات المشاركة / Participating Screens</Text>
              {data.screens.map((sc, i) => (
                <View key={i} style={s.screenRow}>
                  <Text style={s.labelEn}>{sc.location_name || '—'}</Text>
                  <Text style={s.valueAr}>{sc.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Report Date */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={s.labelEn}>Report generated: {todayEn}</Text>
            <Text style={s.labelAr}>تاريخ التقرير: {today}</Text>
          </View>

        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Shelfy Screens · shelfyscreens.com · نظام إعلانات الميني ماركت</Text>
        </View>

      </Page>
    </Document>
  )
}

export async function generateCampaignPdf(data: CampaignReportData): Promise<Buffer> {
  return await renderToBuffer(<CampaignReport data={data} />)
}
