import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions
WIDTH = 1920
HEIGHT = 1080
FPS = 25

# Color Palette (Dark High-Tech Enterprise Theme)
BG_COLOR = (11, 14, 20)           # #0b0e14
CARD_BG = (22, 25, 34)            # #161922
CARD_BORDER = (43, 48, 64)        # #2b3040
TEXT_WHITE = (255, 255, 255)
TEXT_MUTED = (148, 157, 178)
COLOR_PRIMARY = (128, 131, 255)   # #8083ff
COLOR_CYAN = (76, 215, 246)       # #4cd7f6
COLOR_EMERALD = (16, 185, 129)    # #10b981
COLOR_AMBER = (245, 158, 11)      # #f59e0b
COLOR_ROSE = (244, 63, 94)        # #f43f5e

# Fonts
FONT_TITLE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)
FONT_SUBTITLE = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 26)
FONT_HEADING = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 32)
FONT_BODY = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 22)
FONT_BOLD = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22)
FONT_BADGE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)
FONT_FOOTER = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)

def draw_header(draw, title, category="EXECUTIVE PRODUCT OVERVIEW", step="SCENE"):
    # Header strip
    draw.rectangle([(80, 50), (WIDTH - 80, 140)], fill=CARD_BG, outline=CARD_BORDER, width=1)
    
    # Badge
    draw.rounded_rectangle([(105, 75), (280, 115)], radius=6, fill=(128, 131, 255, 40), outline=COLOR_PRIMARY, width=1)
    draw.text((120, 83), "RAGADA ANALYTICS", font=FONT_BADGE, fill=COLOR_PRIMARY)
    
    # Title
    draw.text((310, 75), title, font=FONT_HEADING, fill=TEXT_WHITE)
    
    # Step / Category right badge
    draw.text((WIDTH - 380, 83), f"{category} • {step}", font=FONT_BADGE, fill=COLOR_CYAN)

def draw_footer(draw, current_scene, total_scenes, progress):
    # Bottom Bar
    y_pos = HEIGHT - 60
    draw.rectangle([(80, y_pos), (WIDTH - 80, y_pos + 4)], fill=(30, 34, 45))
    draw.rectangle([(80, y_pos), (80 + int((WIDTH - 160) * progress), y_pos + 4)], fill=COLOR_PRIMARY)
    
    draw.text((80, y_pos + 12), f"Scene {current_scene}/{total_scenes} • High-Fidelity Enterprise Telemetry", font=FONT_FOOTER, fill=TEXT_MUTED)
    draw.text((WIDTH - 360, y_pos + 12), "Confidential • Enterprise Architecture v2.4", font=FONT_FOOTER, fill=TEXT_MUTED)

def scene_1_intro():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Hero Title Box
    draw.rounded_rectangle([(180, 240), (WIDTH - 180, 840)], radius=24, fill=CARD_BG, outline=CARD_BORDER, width=2)
    
    # Decorative Top Accent
    draw.rounded_rectangle([(180, 240), (WIDTH - 180, 248)], radius=4, fill=COLOR_PRIMARY)
    
    # Tag
    draw.rounded_rectangle([(240, 290), (460, 335)], radius=8, fill=(16, 185, 129, 30), outline=COLOR_EMERALD, width=1)
    draw.text((258, 300), "ENTERPRISE SAAS PLATFORM", font=FONT_BADGE, fill=COLOR_EMERALD)
    
    # Main Headline
    draw.text((240, 360), "Ragada Analytics Enterprise", font=FONT_TITLE, fill=TEXT_WHITE)
    draw.text((240, 430), "Next-Generation RFM Behavioral Analytics & Automated Churn Telemetry", font=FONT_SUBTITLE, fill=COLOR_CYAN)
    
    # 3 Pillar Cards
    pillars = [
        ("Real-Time Ingestion", "Sub-8ms Redis query response with verified transactional integrity across millions of events.", COLOR_PRIMARY),
        ("RFM Segmentation Matrix", "Dynamic customer clustering (Champions, Loyal, Needs Attention, At-Risk) with actionable playbooks.", COLOR_EMERALD),
        ("Hardened Zero-Trust", "Docker containerization, rate-limited Nginx reverse proxy, and zero third-party telemetry.", COLOR_CYAN)
    ]
    
    for i, (title, desc, color) in enumerate(pillars):
        x0 = 240 + i * 480
        y0 = 530
        draw.rounded_rectangle([(x0, y0), (x0 + 440, y0 + 240)], radius=16, fill=(16, 19, 26), outline=CARD_BORDER, width=1)
        draw.rectangle([(x0, y0), (x0 + 6, y0 + 240)], fill=color)
        draw.text((x0 + 25, y0 + 25), title, font=FONT_BOLD, fill=TEXT_WHITE)
        # Word wrap desc
        words = desc.split()
        line1 = " ".join(words[:5])
        line2 = " ".join(words[5:10])
        line3 = " ".join(words[10:])
        draw.text((x0 + 25, y0 + 75), line1, font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((x0 + 25, y0 + 110), line2, font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((x0 + 25, y0 + 145), line3, font=FONT_BODY, fill=TEXT_MUTED)
        
    return img

def scene_2_architecture():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Hardened Enterprise Architecture & Infrastructure", "ARCHITECTURE", "02")
    
    # 4 Architecture Blocks
    blocks = [
        ("Nginx Gateway & Reverse Proxy", "Port 5174 • Alpine Linux", "Granular rate limiting (10 req/m auth, 120 req/m API), Gzip compression, and strict OWASP security headers (X-Frame-Options, CSP, HSTS).", COLOR_CYAN),
        ("FastAPI Asynchronous Engine", "Port 8001 • Python 3.11", "High-throughput asynchronous REST endpoints, JWT authentication tokens, Scikit-learn predictive modeling, and live healthchecks.", COLOR_PRIMARY),
        ("PostgreSQL 15 & Redis 7 Cache", "Isolated Docker Network", "Private DB boundary, zero host port exposure for database, sub-8ms in-memory cache, and automated migration scripts.", COLOR_EMERALD),
        ("Celery Async Worker Pipeline", "Distributed Background Daemon", "Decoupled background tasks for heavy RFM matrix calculations, multi-year dataset processing, and executive PDF reporting.", COLOR_AMBER)
    ]
    
    for i, (title, sub, body, color) in enumerate(blocks):
        row = i // 2
        col = i % 2
        x0 = 100 + col * 870
        y0 = 180 + row * 380
        
        draw.rounded_rectangle([(x0, y0), (x0 + 840, y0 + 340)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
        draw.rounded_rectangle([(x0 + 30, y0 + 30), (x0 + 160, y0 + 65)], radius=6, fill=(*color[:3], 30), outline=color, width=1)
        draw.text((x0 + 40, y0 + 38), "CONTAINER", font=FONT_BADGE, fill=color)
        
        draw.text((x0 + 180, y0 + 35), sub, font=FONT_BADGE, fill=TEXT_MUTED)
        draw.text((x0 + 30, y0 + 95), title, font=FONT_HEADING, fill=TEXT_WHITE)
        
        # Description
        words = body.split()
        draw.text((x0 + 30, y0 + 160), " ".join(words[:11]), font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((x0 + 30, y0 + 200), " ".join(words[11:22]), font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((x0 + 30, y0 + 240), " ".join(words[22:]), font=FONT_BODY, fill=TEXT_MUTED)
        
    return img

def scene_3_cockpit():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Executive Cockpit & Real-Time Performance Strip", "TELEMETRY", "03")
    
    # 4 KPI Cards across the top
    kpis = [
        ("TOTAL REVENUE (RUNRATE)", "$1,845,210", "+14.8% vs last month", "$37.9M ARR Runrate", COLOR_PRIMARY),
        ("TRANSACTION VOLUME", "24,960 Tx", "+8.2% capacity", "Avg 4.8 items / order", COLOR_CYAN),
        ("ACTIVE CUSTOMER BASE", "4,316 Accounts", "98.4% engagement", "Lifetime retention positive", COLOR_EMERALD),
        ("AVG CHURN RISK", "18.4% Risk", "Healthy tier status", "Isolated Forest v4.8 alert", COLOR_AMBER)
    ]
    
    for i, (title, val, badge, sub, color) in enumerate(kpis):
        x0 = 100 + i * 435
        y0 = 180
        draw.rounded_rectangle([(x0, y0), (x0 + 410, y0 + 210)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
        draw.text((x0 + 25, y0 + 25), title, font=FONT_BADGE, fill=TEXT_MUTED)
        draw.text((x0 + 25, y0 + 65), val, font=FONT_TITLE, fill=TEXT_WHITE)
        draw.text((x0 + 25, y0 + 135), badge, font=FONT_BOLD, fill=color)
        draw.text((x0 + 25, y0 + 168), sub, font=FONT_FOOTER, fill=TEXT_MUTED)
        
    # Main Visual Dashboard Preview Box
    draw.rounded_rectangle([(100, 420), (WIDTH - 100, 960)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
    
    # Section Header inside box
    draw.text((140, 450), "Consolidated Enterprise Pulse & Health Telemetry", font=FONT_HEADING, fill=TEXT_WHITE)
    draw.text((140, 495), "Continuous stream ingestion from multiple sales channels with sub-second aggregate compilation", font=FONT_BODY, fill=TEXT_MUTED)
    
    # 3 Stat Columns inside
    metrics = [
        ("Database Latency", "< 8ms", "Redis cache layer", COLOR_CYAN),
        ("Data Ingestion Integrity", "100%", "Verified schema checksum", COLOR_EMERALD),
        ("Active Churn Model", "IsoForest 4.8", "92.4% validation accuracy", COLOR_PRIMARY)
    ]
    
    for i, (label, val, note, col) in enumerate(metrics):
        x0 = 140 + i * 560
        y0 = 570
        draw.rounded_rectangle([(x0, y0), (x0 + 510, y0 + 330)], radius=12, fill=(16, 19, 26), outline=CARD_BORDER, width=1)
        draw.text((x0 + 35, y0 + 40), label, font=FONT_SUBTITLE, fill=TEXT_MUTED)
        draw.text((x0 + 35, y0 + 110), val, font=FONT_TITLE, fill=col)
        draw.text((x0 + 35, y0 + 200), note, font=FONT_BODY, fill=TEXT_WHITE)
        draw.text((x0 + 35, y0 + 250), "• Automatic anomaly scanning active\n• Zero data drift detected", font=FONT_FOOTER, fill=TEXT_MUTED)

    return img

def scene_4_dual_axis():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Spotlight: Dual-Axis Revenue & Order Volume Dynamic", "CORE FEATURE", "04")
    
    # Left: Feature Highlights (Span 5)
    draw.rounded_rectangle([(100, 180), (740, 960)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
    draw.text((135, 220), "Dual-Axis Analytical Engine", font=FONT_HEADING, fill=TEXT_WHITE)
    draw.text((135, 270), "Simultaneous financial and operational volume tracking", font=FONT_BODY, fill=TEXT_MUTED)
    
    highlights = [
        ("Multi-Metric Synchronization", "Combines high-scale Revenue ($M) on Left Y-Axis with transactional capacity (k orders) on Right Y-Axis.", COLOR_PRIMARY),
        ("Interactive Mode Switching", "Instant toggle between Dual-Axis, Revenue Only, and Orders Only without page reloads.", COLOR_CYAN),
        ("Growth Drivers Identification", "Distinguishes between basket-size expansion (AOV) vs pure transactional velocity.", COLOR_EMERALD)
    ]
    
    for i, (title, desc, col) in enumerate(highlights):
        y0 = 360 + i * 190
        draw.rounded_rectangle([(135, y0), (705, y0 + 160)], radius=12, fill=(16, 19, 26), outline=CARD_BORDER, width=1)
        draw.text((155, y0 + 20), title, font=FONT_BOLD, fill=col)
        words = desc.split()
        draw.text((155, y0 + 60), " ".join(words[:7]), font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((155, y0 + 95), " ".join(words[7:]), font=FONT_BODY, fill=TEXT_MUTED)
        
    # Right: Chart Simulation Canvas (Span 7)
    draw.rounded_rectangle([(770, 180), (WIDTH - 100, 960)], radius=16, fill=(16, 19, 26), outline=CARD_BORDER, width=1)
    
    # Fake Chart UI Header
    draw.text((810, 220), "Monthly Revenue ($) vs Order Volume (Units)", font=FONT_HEADING, fill=TEXT_WHITE)
    # Mode switch buttons
    draw.rounded_rectangle([(1420, 215), (1540, 255)], radius=6, fill=COLOR_PRIMARY)
    draw.text((1435, 225), "Dual-Axis", font=FONT_BADGE, fill=TEXT_WHITE)
    draw.rounded_rectangle([(1550, 215), (1670, 255)], radius=6, fill=CARD_BG, outline=CARD_BORDER)
    draw.text((1565, 225), "Revenue", font=FONT_BADGE, fill=TEXT_MUTED)
    draw.rounded_rectangle([(1680, 215), (1780, 255)], radius=6, fill=CARD_BG, outline=CARD_BORDER)
    draw.text((1700, 225), "Orders", font=FONT_BADGE, fill=TEXT_MUTED)
    
    # Graph Area
    chart_x = 840
    chart_y = 320
    chart_w = 940
    chart_h = 560
    draw.rectangle([(chart_x, chart_y), (chart_x + chart_w, chart_y + chart_h)], fill=(12, 14, 20), outline=CARD_BORDER)
    
    # Simulated Grid lines
    for gy in range(chart_y + 80, chart_y + chart_h, 100):
        draw.line([(chart_x, gy), (chart_x + chart_w, gy)], fill=(30, 34, 45), width=1)
        
    # Simulated Bars (Order Volume) and Curve (Revenue)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    rev_points = [180, 210, 240, 220, 290, 340, 320, 410, 450, 480, 520, 580]
    bar_heights = [120, 140, 160, 150, 190, 220, 210, 260, 280, 310, 340, 390]
    
    curve_coords = []
    for idx, (m, r, b) in enumerate(zip(months, rev_points, bar_heights)):
        bx = chart_x + 50 + idx * 75
        # Bar
        by0 = chart_y + chart_h - b
        draw.rectangle([(bx, by0), (bx + 30, chart_y + chart_h)], fill=(76, 215, 246, 200), outline=COLOR_CYAN)
        
        # Curve point
        cy = chart_y + chart_h - r
        curve_coords.append((bx + 15, cy))
        draw.text((bx + 5, chart_y + chart_h + 15), m, font=FONT_BADGE, fill=TEXT_MUTED)
        
    # Draw Spline / Connected Lines
    for i in range(len(curve_coords) - 1):
        draw.line([curve_coords[i], curve_coords[i+1]], fill=COLOR_PRIMARY, width=4)
        draw.ellipse([(curve_coords[i][0]-5, curve_coords[i][1]-5), (curve_coords[i][0]+5, curve_coords[i][1]+5)], fill=COLOR_PRIMARY)
    draw.ellipse([(curve_coords[-1][0]-5, curve_coords[-1][1]-5), (curve_coords[-1][0]+5, curve_coords[-1][1]+5)], fill=COLOR_PRIMARY)
    
    return img

def scene_5_rfm_matrix():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Spotlight: RFM Customer Behavioral Matrix & Playbooks", "CORE FEATURE", "05")
    
    # 4 RFM Segment Cards with Playbooks
    segments = [
        ("Champions (VIP)", "R5-F5-M5", "38% Base • $701k Omset", "Pelanggan baru belanja, sangat sering bertransaksi, dan menyumbang omset terbesar.", "🎯 Playbook: Program loyalty VIP concierge & akses awal produk eksklusif.", COLOR_EMERALD),
        ("Loyal Customers", "R4-F4-M4", "29% Base • $535k Omset", "Pelanggan aktif dengan daya beli konsisten dan frekuensi teratur sepanjang tahun.", "🎯 Playbook: Paket promo cross-selling bertingkat & rekomendasi cerdas AI.", COLOR_PRIMARY),
        ("Needs Attention", "R3-F2-M3", "19% Base • $350k Omset", "Pernah aktif belanja, namun tidak ada transaksi dalam 30–60 hari terakhir.", "🎯 Playbook: Voucher diskon personal pemicu repeat-order & notifikasi pengingat.", COLOR_AMBER),
        ("At-Risk Inactive", "R1-F4-M4", "14% Base • $258k Omset", "Pelanggan bernilai tinggi terdahulu yang tidak bertransaksi >60 hari.", "🎯 Playbook: Kampanye re-engagement agresif & survei retensi sebelum churn permanen.", COLOR_ROSE)
    ]
    
    for i, (name, code, stat, desc, playbook, col) in enumerate(segments):
        row = i // 2
        col_idx = i % 2
        x0 = 100 + col_idx * 870
        y0 = 180 + row * 380
        
        draw.rounded_rectangle([(x0, y0), (x0 + 840, y0 + 340)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
        
        # Color bar indicator
        draw.rounded_rectangle([(x0, y0), (x0 + 8, y0 + 340)], radius=4, fill=col)
        
        # Badges
        draw.rounded_rectangle([(x0 + 30, y0 + 30), (x0 + 140, y0 + 68)], radius=6, fill=(*col[:3], 30), outline=col, width=1)
        draw.text((x0 + 40, y0 + 38), code, font=FONT_BADGE, fill=col)
        
        draw.text((x0 + 160, y0 + 38), stat, font=FONT_BOLD, fill=TEXT_WHITE)
        draw.text((x0 + 30, y0 + 90), name, font=FONT_HEADING, fill=TEXT_WHITE)
        
        # Desc
        words = desc.split()
        draw.text((x0 + 30, y0 + 150), " ".join(words[:10]), font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((x0 + 30, y0 + 185), " ".join(words[10:]), font=FONT_BODY, fill=TEXT_MUTED)
        
        # Playbook Box
        draw.rounded_rectangle([(x0 + 30, y0 + 235), (x0 + 810, y0 + 305)], radius=10, fill=(16, 19, 26), outline=CARD_BORDER, width=1)
        draw.text((x0 + 45, y0 + 252), playbook, font=FONT_BODY, fill=COLOR_CYAN)

    return img

def scene_6_churn_anomalies():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Proactive Churn Prevention & Isolated Forest Radar", "AI INTELLIGENCE", "06")
    
    # Left: Isolated Forest Model Card
    draw.rounded_rectangle([(100, 180), (900, 960)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
    draw.text((140, 220), "Anomaly Radar & Loss Prevention", font=FONT_HEADING, fill=TEXT_WHITE)
    draw.text((140, 270), "Machine Learning anomaly scoring on behavioral patterns", font=FONT_BODY, fill=TEXT_MUTED)
    
    insights = [
        ("Anomaly Spike Detected", "Unusual 42% drop in Category Aov detected in segment 3 accounts.", COLOR_ROSE),
        ("Preemptive Retention Triggers", "Automated email & push hooks triggered for accounts with >60% churn probability.", COLOR_AMBER),
        ("Continuous Feature Weighting", "Recency, Frequency, and Monetary scores dynamically re-weighted weekly.", COLOR_EMERALD)
    ]
    
    for i, (title, desc, col) in enumerate(insights):
        y0 = 360 + i * 190
        draw.rounded_rectangle([(140, y0), (860, y0 + 160)], radius=12, fill=(16, 19, 26), outline=CARD_BORDER, width=1)
        draw.text((165, y0 + 20), title, font=FONT_BOLD, fill=col)
        words = desc.split()
        draw.text((165, y0 + 60), " ".join(words[:8]), font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((165, y0 + 95), " ".join(words[8:]), font=FONT_BODY, fill=TEXT_MUTED)
        
    # Right: Top At-Risk Table Simulation
    draw.rounded_rectangle([(930, 180), (WIDTH - 100, 960)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
    draw.text((970, 220), "Top At-Risk Accounts (Real-Time Ingestion)", font=FONT_HEADING, fill=TEXT_WHITE)
    draw.text((970, 270), "Dynamic ranking based on AI churn likelihood scoring", font=FONT_BODY, fill=TEXT_MUTED)
    
    # Table Header
    draw.rectangle([(970, 340), (WIDTH - 140, 390)], fill=(16, 19, 26))
    draw.text((990, 355), "CUSTOMER ID", font=FONT_BADGE, fill=TEXT_MUTED)
    draw.text((1200, 355), "CHURN RISK", font=FONT_BADGE, fill=TEXT_MUTED)
    draw.text((1420, 355), "MONETARY", font=FONT_BADGE, fill=TEXT_MUTED)
    draw.text((1630, 355), "STATUS", font=FONT_BADGE, fill=TEXT_MUTED)
    
    customers = [
        ("CUST-9842", "88.4%", "$14,290", "High Alert", COLOR_ROSE),
        ("CUST-1049", "76.1%", "$9,450", "High Alert", COLOR_ROSE),
        ("CUST-4412", "64.8%", "$18,800", "Moderate", COLOR_AMBER),
        ("CUST-3281", "58.2%", "$7,320", "Moderate", COLOR_AMBER),
        ("CUST-8921", "24.5%", "$22,400", "Healthy", COLOR_EMERALD)
    ]
    
    for i, (cid, risk, mon, stat, col) in enumerate(customers):
        y0 = 420 + i * 100
        draw.rounded_rectangle([(970, y0), (WIDTH - 140, y0 + 80)], radius=8, fill=(16, 19, 26), outline=CARD_BORDER, width=1)
        draw.text((990, y0 + 28), cid, font=FONT_BOLD, fill=TEXT_WHITE)
        draw.text((1200, y0 + 28), risk, font=FONT_BOLD, fill=col)
        draw.text((1420, y0 + 28), mon, font=FONT_BODY, fill=COLOR_CYAN)
        draw.text((1630, y0 + 28), stat, font=FONT_BADGE, fill=col)

    return img

def scene_7_ecosystem_closing():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "The Unified Ragada Analytics Ecosystem", "SUMMARY", "07")
    
    # 3 Platforms
    platforms = [
        ("Web Enterprise SaaS", "dynamic_analytics_saas", "Full-featured multi-tenant analytics suite with live executive overview, clustering, forecasting, and automated PDF reporting.", COLOR_PRIMARY),
        ("Native Android APK", "Ragada_Analytics_Release.apk", "Production signed release build with cross-device compatibility (Vivo Funtouch OS, Samsung, Xiaomi) and zero external runtime dependencies.", COLOR_EMERALD),
        ("Point of Sale Kasir", "ragada_pos_system", "High-speed offline-first POS designed for instant barcode scanning, invoice generation, and real-time synchronization.", COLOR_CYAN)
    ]
    
    for i, (name, path, desc, col) in enumerate(platforms):
        x0 = 100 + i * 580
        y0 = 200
        draw.rounded_rectangle([(x0, y0), (x0 + 550, y0 + 520)], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=1)
        draw.rectangle([(x0, y0), (x0 + 550, y0 + 8)], fill=col)
        
        draw.text((x0 + 35, y0 + 40), name, font=FONT_HEADING, fill=TEXT_WHITE)
        draw.text((x0 + 35, y0 + 95), path, font=FONT_BADGE, fill=col)
        
        words = desc.split()
        draw.text((x0 + 35, y0 + 170), " ".join(words[:7]), font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((x0 + 35, y0 + 215), " ".join(words[7:14]), font=FONT_BODY, fill=TEXT_MUTED)
        draw.text((x0 + 35, y0 + 260), " ".join(words[14:]), font=FONT_BODY, fill=TEXT_MUTED)
        
        draw.text((x0 + 35, y0 + 370), "• Production Ready\n• Zero-Cost Stack\n• 100% Owned Infrastructure", font=FONT_FOOTER, fill=COLOR_CYAN)

    # Closing Callout Box
    draw.rounded_rectangle([(100, 760), (WIDTH - 100, 960)], radius=16, fill=(16, 19, 26), outline=COLOR_PRIMARY, width=1)
    draw.text((150, 810), "Ragada Analytics Enterprise Platform", font=FONT_TITLE, fill=TEXT_WHITE)
    draw.text((150, 880), "Empowering Executive Decisions Through Intelligent Telemetry & Predictable Growth", font=FONT_SUBTITLE, fill=COLOR_CYAN)
    
    return img

def main():
    scenes = [
        ("Intro", scene_1_intro, 7),              # 7 seconds
        ("Architecture", scene_2_architecture, 8),# 8 seconds
        ("Cockpit", scene_3_cockpit, 8),          # 8 seconds
        ("Dual-Axis Chart", scene_4_dual_axis, 9),# 9 seconds
        ("RFM Matrix", scene_5_rfm_matrix, 9),    # 9 seconds
        ("Churn Radar", scene_6_churn_anomalies, 8),# 8 seconds
        ("Closing", scene_7_ecosystem_closing, 7) # 7 seconds
    ]
    
    total_duration = sum(s[2] for s in scenes)
    print(f"Total presentation duration: {total_duration}s ({total_duration * FPS} frames)")
    
    output_path = "Ragada_Analytics_Presentation.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, float(FPS), (WIDTH, HEIGHT))
    
    total_frames_target = total_duration * FPS
    frame_counter = 0
    
    for s_idx, (name, renderer, duration) in enumerate(scenes, 1):
        print(f"Rendering Scene {s_idx}/{len(scenes)}: {name} ({duration}s)...")
        base_img = renderer()
        n_frames = duration * FPS
        
        for f in range(n_frames):
            frame_counter += 1
            progress = frame_counter / total_frames_target
            
            # Copy base image and draw dynamic footer progress
            frame_img = base_img.copy()
            draw = ImageDraw.Draw(frame_img)
            draw_footer(draw, s_idx, len(scenes), progress)
            
            # Convert PIL RGB to OpenCV BGR
            cv_frame = cv2.cvtColor(np.array(frame_img), cv2.COLOR_RGB2BGR)
            
            # Fade-in effect on first 12 frames
            if f < 12:
                alpha = f / 12.0
                cv_frame = (cv_frame * alpha).astype(np.uint8)
            # Fade-out effect on last 8 frames
            elif f >= n_frames - 8:
                alpha = (n_frames - f) / 8.0
                cv_frame = (cv_frame * alpha).astype(np.uint8)
                
            out.write(cv_frame)
            
    out.release()
    print(f"Successfully generated presentation video: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    main()
