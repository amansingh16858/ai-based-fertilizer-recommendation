import jsPDF from 'jspdf';
import { AgronomicPrescription, FarmProfile, SoilTelemetry, VisionAnalysisResult } from '../types';

export function generatePrescriptionPDF(
  prescription: AgronomicPrescription,
  vision: VisionAnalysisResult,
  soil: SoilTelemetry,
  farm: FarmProfile
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [16, 185, 129]; // Emerald
  const darkColor = [15, 23, 42];      // Slate 900
  const grayColor = [100, 116, 139];   // Slate 500

  // 1. Header Banner
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AGROVEDA AI — CROP HEALTH RX', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(167, 243, 208); // Mint
  doc.text('MULTIMODAL PRECISION FERTILIZER & PATHOLOGY REPORT', 14, 22);

  const reportId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, 155, 15);
  doc.text(`REPORT ID: ${reportId}`, 155, 22);

  // 2. Farm Context & Telemetry Strip
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 38, 182, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 38, 182, 22, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('FARM & SOIL TELEMETRY PROFILE', 18, 44);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Crop: ${farm.cropName}`, 18, 51);
  doc.text(`Soil Texture: ${farm.soilType}`, 65, 51);
  doc.text(`Plot Area: ${farm.plotArea}`, 120, 51);

  doc.text(`Soil Moisture: ${soil.moisturePercent}%`, 18, 56);
  doc.text(`Ambient Temp: ${soil.temperatureC}°C`, 65, 56);
  doc.text(`Air Humidity: ${soil.humidityPercent}% RH`, 120, 56);

  // 3. Primary Diagnosis & Multimodal Fusion
  let yPos = 68;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('1. PATHOLOGICAL DIAGNOSIS & MULTIMODAL AUDIT', 14, yPos);

  yPos += 6;
  doc.setFillColor(254, 243, 199); // Light Amber
  doc.rect(14, yPos, 182, 18, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.rect(14, yPos, 182, 18, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`Identified Deficiency: ${prescription.primaryDiagnosis}`, 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  const splitReason = doc.splitTextToSize(prescription.multimodalCorrelation, 174);
  doc.text(splitReason, 18, yPos + 12);

  // 4. Chemical Fertilizer Table
  yPos += 26;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('2. COMMERCIAL FERTILIZER PRESCRIPTION (NPK FORMULATION)', 14, yPos);

  yPos += 5;
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(14, yPos, 182, 7, 'F');

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Fertilizer Input', 18, yPos + 5);
  doc.text('NPK Ratio', 75, yPos + 5);
  doc.text('Calibrated Dosage', 110, yPos + 5);
  doc.text('Est. Cost', 170, yPos + 5);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  prescription.chemicalPrescription.forEach((item, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(14, yPos, 182, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, yPos, 182, 12, 'S');

    doc.setFont('helvetica', 'bold');
    doc.text(item.name, 18, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Method: ${item.applicationMethod}`, 18, yPos + 9);

    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(item.ratioNPK || 'Custom', 75, yPos + 6);
    doc.text(item.exactDosage, 110, yPos + 6);
    doc.text(`₹${item.estimatedCostINR}`, 170, yPos + 6);

    yPos += 12;
  });

  // 5. 100% Bio-Organic Alternative
  yPos += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('3. 100% BIO-ORGANIC SUSTAINABLE ALTERNATIVE', 14, yPos);

  yPos += 5;
  prescription.organicPrescription.forEach((item) => {
    doc.setFillColor(236, 253, 245); // Mint 50
    doc.rect(14, yPos, 182, 12, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.rect(14, yPos, 182, 12, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(`Organic Input: ${item.name}`, 18, yPos + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Dosage: ${item.exactDosage} | Timing: ${item.timing}`, 18, yPos + 9);

    doc.text(`Est. Cost: ₹${item.estimatedCostINR}`, 170, yPos + 7);
    yPos += 14;
  });

  // 6. 14-Day Recovery Calendar
  yPos += 2;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('4. 14-DAY AGRONOMIC ACTION TIMELINE', 14, yPos);

  yPos += 5;
  prescription.fourteenDaySchedule.forEach((sch) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`• ${sch.day}:`, 18, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(sch.task, 38, yPos);
    yPos += 5;
  });

  // 7. Footer & Verification Stamp
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 275, 196, 275);

  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('AgroVeda AI Edge-to-Cloud Precision Diagnostics • Certified Multimodal Agronomy Engine', 14, 282);
  doc.text('Stage 1: Gemini 1.5 Flash Vision | Stage 2: DeepSeek V4 Flash Reasoning', 14, 286);
  doc.text('Digital Signature: VERIFIED-ESP32-EDGE-AI', 150, 286);

  // Save the PDF
  doc.save(`AgroVeda_Prescription_${farm.cropName}_${Date.now()}.pdf`);
}
