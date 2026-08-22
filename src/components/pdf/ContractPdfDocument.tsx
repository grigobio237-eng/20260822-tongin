import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image as PdfImage } from '@react-pdf/renderer';

// React-PDF 기본 폰트는 한글을 지원하지 않으므로 웹 폰트(Noto Sans KR 등) 로드가 필요합니다.
// (실제 프로덕션에서는 TTF/OTF 파일을 public 폴더에 두고 로드하는 것을 권장합니다.)
Font.register({
  family: 'NotoSansKR',
  src: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/NotoSansKR-Regular.woff' // 주의: react-pdf는 woff 지원에 한계가 있을 수 있으므로 TTF 사용 권장
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica', // 한글 폰트 로드 성공 시 'NotoSansKR'로 변경
    fontSize: 10,
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2px solid #1a365d',
    paddingBottom: 10,
    marginBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d'
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 10,
    border: '1px solid #ddd'
  },
  infoCol: {
    flex: 1,
    padding: 5,
    borderRight: '1px solid #ddd'
  },
  infoLabel: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    border: '1px solid #000',
    marginBottom: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #000'
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    padding: 4,
    borderRight: '1px solid #000',
    textAlign: 'center'
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  signatureImage: {
    width: 100,
    height: 50,
    marginLeft: 10
  }
});

// Any 데이터 타입 대신 실제 스토어 상태 인터페이스 사용 권장
export const ContractPdfDocument = ({ data, signatureUrl }: { data: any, signatureUrl: string | null }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>이사견적·계약서</Text>
        <Text>대표전화 02-436-1234</Text>
      </View>

      {/* Customer Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>고객명</Text>
          <Text style={styles.infoValue}>{data.customerInfo.name}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>연락처</Text>
          <Text style={styles.infoValue}>{data.customerInfo.phone}</Text>
        </View>
        <View style={[styles.infoCol, { borderRight: 'none' }]}>
          <Text style={styles.infoLabel}>견적/계약일</Text>
          <Text style={styles.infoValue}>{data.customerInfo.contractDate}</Text>
        </View>
      </View>
      <View style={styles.infoSection}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>출발지</Text>
          <Text style={styles.infoValue}>{data.customerInfo.departureAddress} ({data.customerInfo.departureFloor}층)</Text>
        </View>
        <View style={[styles.infoCol, { borderRight: 'none' }]}>
          <Text style={styles.infoLabel}>도착지</Text>
          <Text style={styles.infoValue}>{data.customerInfo.arrivalAddress} ({data.customerInfo.arrivalFloor}층)</Text>
        </View>
      </View>

      {/* CBM Summary */}
      <View style={[styles.infoSection, { backgroundColor: '#f8fafc' }]}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>총 부피</Text>
          <Text style={styles.infoValue}>{data.totalCbm} CBM</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>투입 차량</Text>
          <Text style={styles.infoValue}>
            5T: {data.resources.vehicles.fiveTon}대 / 2.5T: {data.resources.vehicles.twoHalfTon}대 / 1T: {data.resources.vehicles.oneTon}대
          </Text>
        </View>
        <View style={[styles.infoCol, { borderRight: 'none' }]}>
          <Text style={styles.infoLabel}>작업 인원</Text>
          <Text style={styles.infoValue}>남: {data.resources.workerMale}명 / 여: {data.resources.workerFemale}명</Text>
        </View>
      </View>

      {/* Financials (Dummy Data mapped from options for demo, logic handles total) */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>총계(VAT별도)</Text>
          <Text style={styles.tableCell}>계약금</Text>
          <Text style={styles.tableCell}>잔금</Text>
        </View>
        <View style={styles.tableRow}>
          {/* Note: In a real app, costs would be calculated and passed in data */}
          <Text style={styles.tableCell}>비용 정산 내역 참조</Text>
          <Text style={styles.tableCell}>-</Text>
          <Text style={styles.tableCell}>-</Text>
        </View>
      </View>

      {/* Terms & Notices */}
      <View style={{ marginTop: 20, fontSize: 8, color: '#555', lineHeight: 1.5 }}>
        <Text>▶ 현금·유가증권, 귀금속은 고객이 직접 관리하며 사업자는 책임지지 않습니다.</Text>
        <Text>▶ 도배/잔금 및 대기시 대기료 별도, 에어컨 설치시 부·자재비 별도</Text>
        <Text>▶ 도착지환경에 따라 추가비용이 발생할 수 있습니다. (차량진입 불가시, 계단작업 및 이송작업시)</Text>
      </View>

      {/* Signature */}
      <View style={styles.signatureSection}>
        <Text>고객 서명 (동의함): </Text>
        {signatureUrl ? (
          <PdfImage src={signatureUrl} style={styles.signatureImage} />
        ) : (
          <Text style={{ fontStyle: 'italic', marginLeft: 10 }}>(서명 없음)</Text>
        )}
      </View>

    </Page>
  </Document>
);
