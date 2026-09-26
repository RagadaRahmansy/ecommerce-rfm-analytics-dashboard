import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

def add_page_decorations(canvas_obj, doc_obj):
    """Draws running header and footer decorations natively without canvas state hacks."""
    canvas_obj.saveState()
    canvas_obj.setFont("Helvetica-Bold", 7)
    canvas_obj.setFillColor(colors.HexColor("#475569"))
    
    # Header banner
    canvas_obj.drawString(36, 810, "RAGADA ANALYTICS")
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.drawString(125, 810, "— EXECUTIVE REVENUE & CUSTOMER INTELLIGENCE REPORT")
    canvas_obj.setFont("Helvetica-Bold", 7)
    canvas_obj.setFillColor(colors.HexColor("#DC2626"))
    canvas_obj.drawRightString(559, 810, "STRICTLY CONFIDENTIAL")
    
    # Header separator line
    canvas_obj.setStrokeColor(colors.HexColor("#CBD5E1"))
    canvas_obj.setLineWidth(0.6)
    canvas_obj.line(36, 804, 559, 804)
    
    # Footer separator line
    canvas_obj.setStrokeColor(colors.HexColor("#E2E8F0"))
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(36, 42, 559, 42)
    
    # Footer text
    canvas_obj.setFont("Helvetica", 7.5)
    canvas_obj.setFillColor(colors.HexColor("#64748B"))
    canvas_obj.drawString(36, 30, "Generated automatically by Ragada Analytics Platform • Enterprise SaaS Engine")
    page_str = f"Page {doc_obj.page}"
    canvas_obj.drawRightString(559, 30, page_str)
    canvas_obj.restoreState()


def build_executive_pdf(
    company_name: str,
    kpi: dict,
    trend_data: list,
    clustering_profile: list,
    churn_data: dict,
    date_filter: str = None
) -> bytes:
    """Generates an executive PDF report with structured tables and returns PDF bytes."""
    buffer = io.BytesIO()
    
    # 36pt margins (~0.5 inch) -> usable width: 595.27 - 72 = 523.27 pt
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=48,
        bottomMargin=52
    )

    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A')
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#64748B')
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    desc_style = ParagraphStyle(
        'SectionDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#475569'),
        spaceAfter=5
    )
    
    th_style = ParagraphStyle(
        'TableHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
        alignment=TA_LEFT
    )
    
    th_right_style = ParagraphStyle(
        'TableHeadRight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
        alignment=TA_RIGHT
    )
    
    td_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1E293B')
    )
    
    td_bold_style = ParagraphStyle(
        'TableBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0F172A')
    )
    
    td_right_style = ParagraphStyle(
        'TableBodyRight',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1E293B'),
        alignment=TA_RIGHT
    )
    
    td_right_bold = ParagraphStyle(
        'TableBodyRightBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0F172A'),
        alignment=TA_RIGHT
    )

    story = []

    # 1. Document Title & Header Banner
    story.append(Paragraph("Executive Performance & Customer Intelligence", title_style))
    story.append(Spacer(1, 3))
    
    gen_date = datetime.now().strftime("%d %B %Y, %H:%M WIB")
    filter_label = {
        '30d': 'Last 30 Days (Daily)',
        '90d': 'Last 90 Days (Weekly)',
        'ytd': 'Year to Date 2026',
        '1y': 'Last 12 Months',
        '': 'All Time (2024-2026)'
    }.get(date_filter or '', 'Full Historical Window')
    
    meta_text = (
        f"<b>Organization:</b> {company_name} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Audit Date:</b> {gen_date} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Scope:</b> {filter_label}"
    )
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#3B82F6"), spaceAfter=10))

    # 2. Executive KPI Cards (Grid Table)
    total_rev = kpi.get("total_sales", 0)
    total_tx = kpi.get("total_transactions", 0)
    total_cust = kpi.get("total_customers", 0)
    aov = kpi.get("aov", 0)
    
    kpi_card_data = [
        [
            Paragraph("<b>TOTAL REVENUE</b>", ParagraphStyle('KpiH', fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor("#64748B"), alignment=TA_CENTER)),
            Paragraph("<b>TOTAL TRANSACTIONS</b>", ParagraphStyle('KpiH', fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor("#64748B"), alignment=TA_CENTER)),
            Paragraph("<b>ACTIVE CUSTOMERS</b>", ParagraphStyle('KpiH', fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor("#64748B"), alignment=TA_CENTER)),
            Paragraph("<b>AVERAGE ORDER VALUE</b>", ParagraphStyle('KpiH', fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor("#64748B"), alignment=TA_CENTER)),
        ],
        [
            Paragraph(f"<b>${total_rev:,.2f}</b>", ParagraphStyle('KpiV1', fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=colors.HexColor("#059669"), alignment=TA_CENTER)),
            Paragraph(f"<b>{total_tx:,}</b>", ParagraphStyle('KpiV2', fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=colors.HexColor("#2563EB"), alignment=TA_CENTER)),
            Paragraph(f"<b>{total_cust:,}</b>", ParagraphStyle('KpiV3', fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=colors.HexColor("#7C3AED"), alignment=TA_CENTER)),
            Paragraph(f"<b>${aov:,.2f}</b>", ParagraphStyle('KpiV4', fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=colors.HexColor("#D97706"), alignment=TA_CENTER)),
        ],
        [
            Paragraph("Gross sales volume", ParagraphStyle('KpiSub', fontName='Helvetica', fontSize=6.5, textColor=colors.HexColor("#94A3B8"), alignment=TA_CENTER)),
            Paragraph("Verified orders", ParagraphStyle('KpiSub', fontName='Helvetica', fontSize=6.5, textColor=colors.HexColor("#94A3B8"), alignment=TA_CENTER)),
            Paragraph("Purchasing accounts", ParagraphStyle('KpiSub', fontName='Helvetica', fontSize=6.5, textColor=colors.HexColor("#94A3B8"), alignment=TA_CENTER)),
            Paragraph("Revenue per order", ParagraphStyle('KpiSub', fontName='Helvetica', fontSize=6.5, textColor=colors.HexColor("#94A3B8"), alignment=TA_CENTER)),
        ]
    ]
    
    col_w = 523.27 / 4.0
    kpi_table = Table(kpi_card_data, colWidths=[col_w]*4)
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 10))

    # 3. Monthly Revenue Trend Table
    story.append(Paragraph("1. Monthly Revenue & Order Volume Breakdown", h2_style))
    story.append(Paragraph("Chronological tracking of monthly billing, transaction volume, and operational cadence.", desc_style))
    
    trend_rows = [
        [
            Paragraph("Billing Period", th_style),
            Paragraph("Gross Revenue ($)", th_right_style),
            Paragraph("Transactions", th_right_style),
            Paragraph("AOV ($)", th_right_style),
            Paragraph("Revenue Share", th_right_style)
        ]
    ]
    
    # Take up to last 10 trend periods
    periods = trend_data[-10:] if trend_data else []
    for item in periods:
        p_name = str(item.get("Period", "-"))
        p_rev = float(item.get("TotalPrice", 0))
        # Estimate orders if not directly present in simple trend
        p_tx = int(item.get("Orders", max(1, int(p_rev / max(1.0, aov))))) if "Orders" in item else max(1, int(p_rev / max(1.0, aov)))
        p_aov = p_rev / p_tx if p_tx > 0 else 0
        share = (p_rev / total_rev * 100) if total_rev > 0 else 0
        
        trend_rows.append([
            Paragraph(p_name, td_bold_style),
            Paragraph(f"${p_rev:,.2f}", td_right_style),
            Paragraph(f"{p_tx:,}", td_right_style),
            Paragraph(f"${p_aov:,.2f}", td_right_style),
            Paragraph(f"{share:.1f}%", td_right_style)
        ])
        
    trend_col_widths = [110, 110, 95, 95, 113.27]
    trend_table = Table(trend_rows, colWidths=trend_col_widths)
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#CBD5E1')),
    ]
    for r in range(1, len(trend_rows)):
        if r % 2 == 0:
            t_style.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#F8FAFC')))
    trend_table.setStyle(TableStyle(t_style))
    story.append(trend_table)
    story.append(Spacer(1, 10))

    # 4. Customer RFM Segmentation Table
    story.append(Paragraph("2. Algorithmic RFM Behavioral Segmentation (K-Means)", h2_style))
    story.append(Paragraph("Clustering customer personas by Recency (days inactive), Frequency (orders), and Monetary (spend).", desc_style))
    
    rfm_rows = [
        [
            Paragraph("Cluster Persona", th_style),
            Paragraph("Customer Count", th_right_style),
            Paragraph("Avg Recency", th_right_style),
            Paragraph("Avg Frequency", th_right_style),
            Paragraph("Avg Spend ($)", th_right_style),
            Paragraph("Recommended Strategic Focus", th_style)
        ]
    ]
    
    # Persona mapping based on cluster characteristics
    persona_names = [
        "Champions / VIPs",
        "Loyal Repeat Spenders",
        "At Risk (Lapsing)",
        "Dormant / Needs Win-back",
        "Recent New Buyers"
    ]
    
    profile_list = clustering_profile if clustering_profile else []
    for idx, c in enumerate(profile_list):
        c_name = persona_names[idx % len(persona_names)]
        c_count = int(c.get("CustomerCount", 0))
        c_rec = float(c.get("Recency", 0))
        c_freq = float(c.get("Frequency", 0))
        c_mon = float(c.get("Monetary", 0))
        
        if c_mon > 1500 or c_freq > 8:
            focus = "VIP Loyalty Rewards & Dedicated Support"
        elif c_rec > 60:
            focus = "Re-activation Campaign & Flash Voucher"
        elif c_freq > 3:
            focus = "Cross-sell Complementary Bundles"
        else:
            focus = "Onboarding Nurture & Review Request"
            
        rfm_rows.append([
            Paragraph(f"<b>Cluster #{c.get('Cluster', idx)}</b><br/><font color='#64748B'>{c_name}</font>", td_style),
            Paragraph(f"<b>{c_count:,}</b>", td_right_style),
            Paragraph(f"{c_rec:.0f} days", td_right_style),
            Paragraph(f"{c_freq:.1f} orders", td_right_style),
            Paragraph(f"<b>${c_mon:,.2f}</b>", td_right_style),
            Paragraph(focus, td_style)
        ])
        
    rfm_col_widths = [110, 75, 65, 65, 75, 133.27]
    rfm_table = Table(rfm_rows, colWidths=rfm_col_widths)
    rfm_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for r in range(1, len(rfm_rows)):
        if r % 2 == 0:
            rfm_style.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#F8FAFC')))
    rfm_table.setStyle(TableStyle(rfm_style))
    story.append(rfm_table)
    story.append(Spacer(1, 10))

    # 5. Churn Risk & VIP Retention Table
    top_at_risk = churn_data.get("top_at_risk", []) if isinstance(churn_data, dict) else []
    if top_at_risk:
        story.append(KeepTogether([
            Paragraph("3. High-Value Customer Churn Prevention (Action Required)", h2_style),
            Paragraph("Top accounts at risk of churn (>60 days inactive) sorted by highest historic contribution.", desc_style)
        ]))
        
        churn_rows = [
            [
                Paragraph("Customer ID", th_style),
                Paragraph("Past Orders", th_right_style),
                Paragraph("Historic Spend ($)", th_right_style),
                Paragraph("Churn Probability", th_right_style),
                Paragraph("Recommended Retention Action", th_style)
            ]
        ]
        
        for item in top_at_risk[:6]: # Top 6 risky VIPs
            cid = str(item.get("CustomerID", "-"))
            freq = int(item.get("Frequency", 0))
            spent = float(item.get("Monetary", 0))
            risk_pct = float(item.get("RiskPercent", 0))
            
            action = "Concierge personal outreach + 15% VIP loyalty bonus" if spent > 1000 else "Automated personalized win-back email blast"
            
            churn_rows.append([
                Paragraph(f"<b>#{cid}</b>", td_bold_style),
                Paragraph(f"{freq:,}", td_right_style),
                Paragraph(f"<b>${spent:,.2f}</b>", td_right_bold),
                Paragraph(f"<font color='#DC2626'><b>{risk_pct:.1f}%</b></font>", td_right_style),
                Paragraph(action, td_style)
            ])
            
        churn_col_widths = [95, 75, 105, 95, 153.27]
        churn_table = Table(churn_rows, colWidths=churn_col_widths)
        c_style = [
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#CBD5E1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]
        for r in range(1, len(churn_rows)):
            if r % 2 == 0:
                c_style.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#F8FAFC')))
        churn_table.setStyle(TableStyle(c_style))
        story.append(churn_table)

    # Build PDF with dynamic header and footer page decorations
    doc.build(story, onFirstPage=add_page_decorations, onLaterPages=add_page_decorations)
    buffer.seek(0)
    return buffer.getvalue()
