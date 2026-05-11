"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { useTranslations, useLocale } from "next-intl";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface EmirateData {
  id: string;
  name_en: string;
  name_ar: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Static emirate meta — paths, colours, label positions              */
/* ------------------------------------------------------------------ */

/*  The SVG paths below are derived from geoBoundaries open data
    (OpenStreetMap-based UAE admin-1 boundaries), projected and simplified
    to fit a 900×600 viewBox.  */

interface EmirateShape {
  id: string;
  name_en: string;
  name_ar: string;
  path: string;
  labelX: number;
  labelY: number;
  color: string;
  hoverColor: string;
  strokeColor: string;
}

const EMIRATES: EmirateShape[] = [
  {
    id: "abu_dhabi",
    name_en: "Abu Dhabi",
    name_ar: "أبوظبي",
    path: "M591.2,215.2L585.3,218.6L591.0,225.0L584.2,217.4L579.3,223.4L572.2,223.0L575.5,231.9L569.9,237.0L571.8,226.6L569.4,232.4L562.8,232.1L557.1,225.4L559.5,229.2L555.5,232.3L562.8,232.3L558.8,233.4L561.4,234.5L556.7,238.8L559.8,239.9L552.3,244.2L557.0,242.7L554.6,246.9L560.2,252.8L552.9,258.8L551.7,271.8L547.8,273.4L552.8,277.4L549.4,284.9L530.2,289.1L535.2,293.1L529.1,293.3L535.5,294.7L527.4,295.2L524.7,304.5L534.3,305.5L493.4,318.7L475.9,303.4L470.0,308.3L471.2,313.2L479.5,317.0L472.6,314.6L471.1,317.0L477.4,319.7L467.5,318.2L471.2,322.9L465.7,321.1L468.4,325.0L462.9,322.2L459.1,325.0L466.6,328.3L476.5,320.3L483.1,324.6L472.6,330.7L467.2,328.7L468.5,331.9L460.8,329.1L465.3,333.2L459.0,331.3L460.2,333.5L449.3,337.0L450.3,341.1L444.1,342.0L443.0,335.1L443.5,342.3L425.1,343.1L426.9,345.5L411.7,342.0L397.4,346.6L386.4,338.6L376.2,337.4L372.4,334.3L374.4,331.9L367.1,336.6L352.8,335.2L352.0,339.2L347.6,330.3L342.1,331.9L346.9,338.1L338.1,333.2L324.7,335.7L320.9,328.7L320.3,332.8L311.5,335.0L309.7,332.2L314.7,328.3L309.7,332.1L306.0,328.9L309.5,332.9L302.4,329.1L295.8,333.1L277.9,330.9L270.7,334.0L263.3,331.6L263.3,328.1L262.1,331.4L261.7,326.5L262.1,331.5L257.9,330.7L259.6,324.7L255.5,333.6L249.8,323.8L243.3,320.5L238.0,326.3L239.9,332.6L224.3,339.2L219.6,334.9L221.8,342.7L197.0,355.2L166.9,359.6L145.5,353.2L138.3,357.0L128.5,355.1L121.3,348.0L120.1,311.6L114.9,308.7L109.3,321.6L101.8,303.6L104.6,315.4L98.6,322.2L99.2,305.3L89.6,294.0L92.8,295.5L94.2,310.4L92.1,333.8L241.9,513.5L628.6,560.0L640.0,548.8L642.9,487.6L694.4,409.0L693.9,395.3L688.2,389.3L688.5,375.8L681.2,361.4L718.4,344.2L726.0,344.6L733.8,350.8L761.7,343.0L752.2,319.4L733.9,322.6L721.7,317.5L733.9,303.5L734.0,291.1L723.5,272.9L723.9,266.4L731.2,260.0L727.9,256.7L734.3,251.5L732.1,233.4L703.9,244.3L684.7,244.6L681.4,255.5L652.4,258.6L638.4,253.3L611.3,221.7L591.2,215.2Z M424.7,318.0L426.8,315.6L416.0,317.1L399.5,327.7L423.0,334.9L431.0,332.3L433.4,325.8L438.5,330.6L433.7,330.5L442.6,334.9L441.2,330.5L446.0,333.5L452.0,329.7L448.4,329.8L452.5,325.6L448.2,319.4L444.7,321.5L435.7,316.9L434.5,313.6L438.0,312.9L433.6,311.6L430.1,315.4L428.6,324.8L426.1,319.9L429.2,313.6L424.7,318.0Z",
    labelX: 380,
    labelY: 350,
    color: "#E8973F",
    hoverColor: "#F5B062",
    strokeColor: "#C47B2B",
  },
  {
    id: "dubai",
    name_en: "Dubai",
    name_ar: "دبي",
    path: "M719.6,239.1L707.9,202.1L703.0,169.9L661.5,156.7L661.3,152.2L657.1,157.1L657.9,152.4L652.1,147.9L652.2,151.9L656.8,152.8L650.3,155.7L652.4,159.5L656.0,158.0L648.5,159.5L651.7,158.8L650.6,162.2L646.8,159.0L649.3,163.8L645.6,160.9L648.1,165.4L621.4,196.4L610.2,204.0L610.3,198.7L608.6,204.9L606.5,200.8L609.6,200.5L606.3,200.5L609.6,199.8L606.1,200.3L609.1,198.8L603.2,199.0L603.2,203.0L605.6,200.8L603.8,203.4L605.8,201.1L608.2,205.1L600.8,203.4L605.8,206.1L596.6,211.9L591.4,209.4L595.9,212.3L591.2,215.2L611.3,221.7L638.4,253.3L652.4,258.6L678.2,256.5L683.5,254.4L684.7,244.6L698.9,245.1L719.6,239.1Z M770.6,241.2L780.9,240.9L789.5,234.3L789.9,228.4L775.0,229.0L770.6,241.2Z",
    labelX: 630,
    labelY: 195,
    color: "#3A7FD5",
    hoverColor: "#5A9AE8",
    strokeColor: "#2960A8",
  },
  {
    id: "sharjah",
    name_en: "Sharjah",
    name_ar: "الشارقة",
    path: "M732.1,233.4L730.7,215.3L736.6,206.9L745.6,207.0L754.9,201.3L750.9,189.8L756.2,180.2L751.8,171.9L757.0,168.5L753.2,155.1L759.2,144.2L753.5,143.1L750.6,152.5L745.0,148.9L744.8,157.2L731.8,159.8L725.1,147.4L714.9,138.7L700.5,134.3L686.6,123.3L679.2,133.6L703.1,139.7L697.5,146.1L683.9,147.8L671.8,141.5L665.1,147.7L666.7,151.9L660.7,154.5L703.0,169.9L707.9,202.1L719.6,239.1L732.1,233.4Z M811.5,212.5L808.0,206.0L816.0,204.6L813.7,191.5L801.8,189.8L805.2,202.9L799.4,205.6L786.5,194.0L781.8,194.3L788.3,207.0L786.9,215.8L797.3,217.7L798.3,214.6L811.5,212.5Z M815.9,154.2L811.7,145.1L814.2,138.2L799.4,147.9L798.5,151.8L806.8,157.0L815.9,154.2Z M790.1,155.2L790.5,163.0L796.2,160.1L794.4,154.8L790.1,155.2Z",
    labelX: 710,
    labelY: 165,
    color: "#E2B830",
    hoverColor: "#F0CE55",
    strokeColor: "#C49D20",
  },
  {
    id: "ajman",
    name_en: "Ajman",
    name_ar: "عجمان",
    path: "M679.2,133.6L671.8,141.5L682.3,147.5L697.5,146.1L703.1,139.7L679.2,133.6Z M767.7,221.1L756.1,217.7L770.6,241.2L775.0,229.0L767.7,221.1Z M756.5,151.6L753.2,155.1L755.6,159.1L760.3,155.2L756.5,151.6Z",
    labelX: 670,
    labelY: 138,
    color: "#D44E6C",
    hoverColor: "#E87088",
    strokeColor: "#B83A54",
  },
  {
    id: "umm_al_quwain",
    name_en: "Umm Al Quwain",
    name_ar: "أم القيوين",
    path: "M718.8,104.1L706.0,112.7L703.7,115.7L707.2,119.1L699.7,123.2L703.6,120.6L692.5,120.5L695.3,109.6L686.6,123.3L700.5,134.3L714.9,138.7L725.7,148.2L730.1,159.3L744.8,157.2L744.5,149.4L748.2,149.2L739.3,141.8L743.0,137.0L734.8,130.0L733.1,116.8L718.8,104.1Z M701.9,110.3L716.0,102.6L696.5,112.8L701.9,110.3Z",
    labelX: 715,
    labelY: 115,
    color: "#9260C8",
    hoverColor: "#AB80DD",
    strokeColor: "#7545A8",
  },
  {
    id: "ras_al_khaimah",
    name_en: "Ras Al Khaimah",
    name_ar: "رأس الخيمة",
    path: "M782.8,101.8L780.4,90.6L785.1,85.4L780.1,75.9L785.9,66.7L783.9,58.5L788.6,53.6L782.2,40.0L771.5,43.0L769.8,52.0L766.1,53.2L767.8,59.6L766.2,55.5L760.2,67.1L763.5,68.0L766.7,61.2L768.2,65.6L761.4,67.8L751.8,78.6L753.9,84.4L749.6,84.8L751.4,79.2L737.8,92.8L725.9,92.0L727.4,97.1L719.6,99.9L718.8,104.1L733.1,116.8L734.8,130.0L743.0,137.0L739.3,141.8L750.6,152.5L754.0,142.7L770.7,150.1L780.2,147.2L780.7,140.7L772.9,138.7L778.9,130.4L774.4,125.8L756.5,127.4L753.7,114.5L769.2,104.3L782.8,101.8Z M775.0,229.0L789.9,228.4L790.2,224.4L800.1,220.6L785.1,213.0L788.3,207.0L781.6,195.2L782.5,168.8L791.2,165.6L789.2,152.5L783.4,151.1L776.9,154.7L786.3,157.3L779.6,161.3L777.8,168.8L757.0,167.7L751.8,171.9L756.2,180.2L751.2,195.9L768.0,209.4L765.4,218.9L775.0,229.0Z",
    labelX: 750,
    labelY: 75,
    color: "#44A850",
    hoverColor: "#62C26D",
    strokeColor: "#328E3D",
  },
  {
    id: "fujairah",
    name_en: "Fujairah",
    name_ar: "الفجيرة",
    path: "M755.6,159.1L757.0,167.7L776.7,169.4L779.9,160.9L786.3,157.3L777.5,153.9L797.9,152.4L800.1,146.9L815.0,137.0L812.6,111.6L789.6,109.2L788.0,103.7L782.8,101.8L754.6,111.5L756.5,127.4L774.4,125.8L778.9,131.3L772.9,138.7L780.5,140.5L781.0,144.7L772.5,150.3L759.2,144.2L756.5,151.6L760.2,155.9L755.6,159.1Z M791.2,165.6L782.6,168.3L782.1,189.5L795.3,204.0L802.8,205.1L805.7,199.3L801.8,189.8L813.7,191.5L815.9,154.2L811.1,161.9L800.0,167.4L791.2,165.6Z M811.5,212.5L798.3,214.6L799.5,222.0L811.5,212.5Z",
    labelX: 800,
    labelY: 140,
    color: "#6DB844",
    hoverColor: "#88D060",
    strokeColor: "#559832",
  },
];

/* ------------------------------------------------------------------ */
/*  Neighbouring countries (projected with the same coordinate system) */
/* ------------------------------------------------------------------ */
interface NeighbourShape {
  id: string;
  name_en: string;
  name_ar: string;
  path: string;
  labelX: number;
  labelY: number;
}

const NEIGHBOURS: NeighbourShape[] = [
  {
    id: "oman",
    name_en: "Oman",
    name_ar: "عُمان",
    path: "M765.9,206.6L753.1,200.9L730.7,215.3L734.3,251.5L723.5,272.9L734.0,291.1L733.9,303.5L721.7,317.5L733.9,322.6L752.2,319.4L761.7,343.0L733.8,350.8L718.4,344.2L681.2,361.4L694.2,409.7L642.9,487.6L639.8,548.8L708.6,655.5L607.8,958.0L154.0,1109.3L272.4,1358.9L266.8,1367.3L276.9,1368.6L321.8,1464.7L373.2,1449.0L393.9,1449.8L419.2,1431.3L451.6,1425.8L463.7,1413.3L551.2,1407.7L577.0,1421.3L606.7,1408.7L610.9,1411.7L647.5,1375.8L644.5,1369.8L654.0,1351.8L643.5,1342.0L642.1,1331.3L665.0,1308.8L672.3,1288.2L703.4,1277.7L755.8,1271.1L812.6,1272.6L825.2,1252.8L842.5,1241.4L858.8,1170.2L854.0,1178.7L854.7,1174.3L878.6,1148.5L948.5,1122.7L1016.7,1118.4L1036.3,1110.6L1031.9,1085.7L1023.0,1074.2L1025.2,1047.4L1015.9,1029.6L1020.8,1004.9L1018.4,1009.7L1012.8,1002.4L1032.9,960.7L1035.0,927.5L1055.4,910.3L1054.5,896.9L1071.9,888.0L1077.6,867.4L1088.9,863.6L1108.9,875.1L1098.5,880.9L1093.2,897.9L1128.1,905.1L1140.3,895.1L1148.8,857.2L1162.3,851.6L1158.9,842.3L1173.7,844.5L1173.4,838.6L1162.3,845.7L1161.1,838.1L1173.9,830.1L1190.3,797.6L1216.2,770.6L1264.9,741.3L1287.5,692.3L1311.6,663.3L1315.0,645.2L1335.3,621.3L1339.8,591.5L1333.5,574.3L1324.1,574.4L1325.1,582.6L1323.0,574.3L1286.5,567.0L1256.8,539.9L1242.5,510.5L1223.7,497.7L1211.1,472.6L1199.8,466.2L1200.7,456.4L1180.4,440.5L1175.6,425.2L1159.8,421.8L1147.0,408.0L1111.0,412.4L1089.4,399.5L1043.5,396.6L1030.0,385.9L1009.1,386.5L934.7,361.3L899.7,334.1L853.4,272.9L847.4,275.6L816.0,204.6L808.0,205.9L808.6,216.8L790.2,224.4L789.5,234.3L777.1,242.0L767.3,239.3L755.8,220.3L768.5,221.3L765.9,206.6Z M816.5,-8.0L807.9,4.8L815.8,11.9L807.5,7.0L805.0,19.4L817.9,13.9L822.0,19.5L792.6,20.9L791.5,11.7L771.8,41.8L782.3,40.0L788.6,53.6L780.2,92.6L789.6,109.2L799.3,110.1L800.8,93.8L815.1,79.7L818.7,60.4L828.4,58.8L819.6,55.2L823.7,46.7L817.4,44.9L831.0,37.8L816.3,37.3L815.5,30.3L809.3,35.9L808.5,26.4L816.8,19.9L816.3,27.8L821.9,21.9L823.4,30.4L832.9,30.7L824.7,21.3L832.6,21.9L833.6,15.1L823.3,15.5L818.9,7.7L837.9,2.5L835.7,-3.7L828.4,1.8L816.5,-8.0Z",
    labelX: 820,
    labelY: 370,
  },
  {
    id: "saudi_arabia",
    name_en: "Saudi Arabia",
    name_ar: "السعودية",
    path: "M-917.3,-431.1L-946.8,-433.3L-1345.6,-722.7L-1443.1,-762.2L-1598.5,-849.2L-1781.9,-880.4L-1811.3,-857.1L-2114.7,-781.4L-1964.0,-630.2L-2014.1,-604.8L-2038.3,-554.6L-2152.1,-534.6L-2189.7,-478.9L-2255.0,-431.0L-2423.8,-457.1L-2451.3,-352.1L-2446.7,-331.1L-2468.9,-276.9L-2482.2,-266.5L-2476.3,-266.5L-2474.1,-255.6L-2461.4,-273.0L-2454.4,-267.4L-2456.8,-261.0L-2445.5,-268.7L-2448.2,-262.8L-2440.2,-269.1L-2440.2,-262.6L-2412.2,-265.4L-2415.3,-270.4L-2383.7,-259.0L-2392.3,-252.2L-2376.8,-244.4L-2362.8,-221.2L-2352.3,-217.8L-2327.7,-166.3L-2295.2,-134.8L-2296.3,-117.9L-2264.9,-90.9L-2251.2,-61.5L-2228.7,-42.2L-2191.0,32.9L-2159.3,45.9L-2168.6,73.0L-2153.2,90.0L-2144.9,94.7L-2141.8,88.1L-2124.0,104.0L-2114.9,126.2L-2103.7,133.9L-2098.0,154.4L-2078.6,173.0L-2071.5,203.2L-2074.6,221.8L-2081.1,229.9L-2091.3,228.4L-2080.0,233.1L-2081.3,246.1L-2063.2,257.5L-2045.1,286.8L-2050.2,297.1L-2027.7,315.8L-2019.1,315.3L-2021.6,308.5L-2010.0,307.6L-1984.5,330.0L-1974.3,330.9L-1976.9,323.2L-1970.8,321.2L-1972.7,328.9L-1964.9,329.3L-1973.5,331.1L-1920.4,362.3L-1893.5,386.2L-1881.4,422.6L-1873.2,423.9L-1879.4,419.1L-1872.0,417.9L-1860.1,459.2L-1848.0,477.7L-1845.1,474.7L-1842.8,503.0L-1824.5,510.7L-1816.4,525.0L-1824.1,526.7L-1835.1,513.6L-1814.3,543.4L-1810.5,540.6L-1814.1,545.3L-1797.0,575.9L-1797.8,601.0L-1790.6,594.0L-1806.1,624.8L-1809.6,641.2L-1804.3,630.6L-1804.2,646.1L-1810.0,646.2L-1811.0,657.7L-1817.6,657.7L-1813.6,649.7L-1822.9,653.7L-1816.7,663.0L-1819.9,669.5L-1810.5,682.9L-1806.4,679.9L-1810.3,683.1L-1799.8,699.5L-1786.2,689.0L-1799.3,700.5L-1795.4,726.0L-1784.3,732.2L-1789.9,735.1L-1785.6,750.0L-1797.4,757.8L-1783.5,791.4L-1771.9,801.5L-1765.7,818.0L-1756.1,821.6L-1757.3,826.9L-1743.2,833.5L-1748.2,834.3L-1743.3,845.5L-1738.2,847.7L-1744.2,839.2L-1736.9,842.4L-1731.7,861.0L-1701.8,898.8L-1668.9,918.7L-1676.0,912.2L-1644.1,916.8L-1635.5,929.2L-1625.3,929.0L-1617.7,943.0L-1579.6,963.0L-1579.9,972.7L-1562.8,993.9L-1557.5,995.4L-1562.7,989.3L-1549.5,988.5L-1540.9,998.4L-1539.5,1018.6L-1543.4,1017.0L-1515.4,1034.2L-1516.9,1056.2L-1503.0,1069.5L-1498.8,1091.1L-1485.6,1095.7L-1490.2,1116.0L-1485.5,1127.0L-1473.1,1131.9L-1478.7,1152.0L-1470.9,1168.0L-1446.5,1182.7L-1438.3,1216.0L-1431.8,1219.1L-1435.5,1225.3L-1430.0,1224.5L-1418.6,1251.3L-1412.0,1253.4L-1413.3,1260.8L-1408.6,1258.0L-1392.7,1285.1L-1374.9,1289.8L-1310.7,1345.3L-1302.3,1409.6L-1298.5,1394.3L-1304.2,1383.0L-1294.3,1387.7L-1290.1,1403.4L-1274.4,1411.4L-1279.1,1429.5L-1251.4,1452.4L-1250.4,1477.1L-1240.8,1492.2L-1244.3,1500.8L-1232.9,1505.7L-1215.1,1502.6L-1214.8,1487.9L-1189.8,1482.6L-1185.4,1460.6L-1171.9,1464.7L-1175.4,1455.6L-1166.9,1442.8L-1186.5,1425.3L-1177.8,1420.2L-1179.9,1407.0L-1169.7,1409.5L-1183.4,1394.6L-1174.5,1380.0L-1176.4,1372.4L-1156.4,1365.8L-1173.1,1347.3L-1170.8,1339.1L-1153.6,1327.7L-1134.0,1329.4L-1103.9,1356.3L-1087.9,1355.1L-1081.4,1360.6L-1061.0,1361.8L-1054.3,1350.9L-1039.2,1356.4L-1035.1,1350.0L-997.2,1346.0L-970.3,1350.2L-871.9,1346.0L-844.2,1361.4L-738.4,1374.0L-698.0,1376.5L-640.1,1369.0L-602.2,1419.2L-574.5,1419.4L-531.6,1394.2L-511.5,1343.7L-423.3,1235.3L-282.1,1167.3L-30.0,1142.1L154.0,1109.3L607.8,958.0L708.6,655.5L639.4,548.3L628.6,560.0L241.9,513.5L92.1,333.8L91.9,314.5L83.6,315.1L69.7,303.8L45.3,309.9L51.7,288.0L79.1,266.1L63.5,258.4L49.8,276.3L17.7,281.8L-8.1,270.3L-25.7,240.4L-32.2,244.1L-38.4,221.2L-60.4,191.2L-59.7,197.0L-63.5,195.2L-73.9,140.8L-90.9,124.3L-88.1,139.5L-115.4,108.0L-116.8,98.7L-124.9,96.8L-128.0,89.8L-112.9,98.5L-108.4,109.2L-108.7,100.1L-131.9,68.4L-132.4,53.0L-143.5,47.2L-148.4,52.2L-150.3,33.4L-143.5,20.0L-124.9,44.6L-122.9,23.4L-120.6,27.8L-115.1,22.6L-112.5,-5.6L-122.6,-14.1L-116.2,-21.0L-118.6,-28.8L-123.8,-13.4L-128.1,-24.7L-132.6,-18.6L-142.1,-24.8L-145.2,-35.7L-135.5,-31.1L-134.7,-35.8L-136.5,-40.3L-145.2,-35.8L-149.3,-62.0L-142.7,-50.8L-130.0,-52.8L-123.7,-46.2L-155.3,-78.5L-181.4,-85.4L-198.0,-97.8L-193.8,-105.4L-206.6,-109.1L-191.2,-114.0L-206.4,-110.0L-213.6,-120.1L-210.6,-132.1L-206.8,-124.2L-210.6,-132.3L-204.9,-143.6L-215.9,-125.4L-226.3,-145.9L-220.4,-151.5L-214.2,-143.3L-193.5,-146.2L-226.2,-152.9L-229.5,-136.2L-219.0,-130.3L-224.8,-125.3L-222.1,-117.8L-237.8,-119.9L-231.6,-112.6L-244.2,-118.7L-237.4,-130.2L-244.7,-129.7L-246.7,-122.1L-251.2,-128.2L-251.5,-150.1L-266.8,-147.7L-261.5,-162.6L-269.0,-157.5L-281.0,-161.8L-278.7,-167.4L-271.2,-168.1L-272.0,-163.8L-255.2,-170.4L-252.5,-165.0L-261.3,-180.3L-293.6,-185.5L-304.4,-194.8L-314.2,-186.2L-312.5,-195.3L-323.5,-192.9L-318.8,-192.6L-322.5,-197.8L-317.7,-202.6L-322.9,-200.3L-327.6,-213.2L-332.4,-208.6L-328.3,-224.7L-329.1,-214.3L-323.7,-223.8L-319.4,-220.6L-323.6,-210.0L-316.3,-224.6L-337.9,-244.8L-331.0,-251.9L-346.1,-254.5L-356.9,-264.9L-354.9,-281.5L-373.1,-302.1L-368.9,-313.9L-380.1,-309.9L-370.9,-315.3L-375.1,-326.8L-385.9,-332.8L-495.7,-331.3L-510.6,-351.1L-513.4,-378.6L-531.8,-403.3L-668.3,-418.4L-689.0,-412.5L-917.3,-431.1Z",
    labelX: 55,
    labelY: 480,
  },
  {
    id: "qatar",
    name_en: "Qatar",
    name_ar: "قطر",
    path: "M40.9,26.5L7.9,43.9L6.4,55.2L1.1,53.3L-3.9,75.7L0.3,84.3L-7.7,79.5L-13.5,94.5L-10.1,106.0L1.0,104.8L-9.3,111.3L-10.1,125.1L-17.2,119.6L-15.4,106.2L-20.5,102.9L-19.3,108.6L-28.4,111.0L-23.3,111.4L-20.0,131.3L-27.6,121.6L-34.0,125.5L-31.8,184.6L-16.8,231.8L-25.7,240.4L-8.1,270.3L17.7,281.8L48.4,276.6L50.7,262.4L36.2,255.8L54.8,253.6L53.4,268.6L58.6,265.3L62.9,254.1L68.7,253.6L76.8,227.0L102.5,197.9L93.4,202.3L92.4,196.6L101.7,196.7L95.4,198.6L93.5,165.1L98.2,163.5L94.9,156.1L81.4,156.5L84.8,152.6L79.1,145.8L84.7,143.6L79.7,138.5L85.1,133.7L74.5,124.1L77.7,110.4L86.5,105.2L79.2,97.0L86.8,95.0L89.0,100.2L92.5,94.6L84.1,88.4L93.0,84.3L91.0,71.5L102.9,65.8L91.1,71.4L88.0,66.9L99.0,65.1L91.5,66.6L99.1,63.1L93.8,59.9L102.3,61.6L66.0,57.1L57.1,34.9L40.9,26.5Z",
    labelX: 35,
    labelY: 155,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MapPage() {
  const t = useTranslations("map");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [emirates, setEmirates] = useState<EmirateData[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  /* Fetch data */
  useEffect(() => {
    fetch("/api/emirates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => b.count - a.count);
          setEmirates(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const emirateDataMap = useMemo(() => {
    const m: Record<string, EmirateData> = {};
    emirates.forEach((e) => (m[e.id] = e));
    return m;
  }, [emirates]);

  const maxCount = useMemo(
    () => Math.max(...emirates.map((e) => e.count), 1),
    [emirates]
  );

  /* Interaction helpers */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const getEmirateName = useCallback(
    (id: string) => {
      const shape = EMIRATES.find((e) => e.id === id);
      const data = emirateDataMap[id];
      if (isRtl) return data?.name_ar ?? shape?.name_ar ?? id;
      return data?.name_en ?? shape?.name_en ?? id;
    },
    [emirateDataMap, isRtl]
  );

  const getEmirateCount = useCallback(
    (id: string) => emirateDataMap[id]?.count ?? 0,
    [emirateDataMap]
  );

  const getShape = (id: string) => EMIRATES.find((e) => e.id === id);

  const toggleSelect = (id: string) =>
    setSelectedId((prev) => (prev === id ? null : id));

  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[var(--bg-deep)]" dir="auto">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-12 px-2 sm:px-0">
          <div className="text-start">
            <h1 className="font-sans font-black text-xl sm:text-4xl text-[var(--white)] mb-1 sm:mb-2">
              {t("heroTitle")}
            </h1>
            <p className="text-[var(--muted-light)] text-sm sm:text-base">{t("heroDesc")}</p>
          </div>
          <div className="bg-[var(--gold-dim)] border border-[var(--gold)] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[var(--gold)] font-bold shadow-[var(--glow-gold)] text-sm sm:text-base">
            {t("emiratesParticipation")}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-8">
          {/* ========== MAP ========== */}
          <div
            ref={containerRef}
            className="xl:col-span-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-2 sm:p-6 relative overflow-hidden shadow-lg"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setHoveredId(null);
              setTooltipPos(null);
            }}
          >
            <ShamsaPattern className="opacity-[0.02] absolute inset-0 z-0" />

            <svg
              ref={svgRef}
              viewBox="-20 -20 940 640"
              className="w-full h-auto relative z-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Definitions for glow / shadow effects */}
              <defs>
                <filter id="emirate-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feFlood floodColor="rgba(215,188,109,0.5)" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="emirate-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.3)" />
                </filter>
                {/* Sea gradient */}
                <linearGradient id="sea-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0a1628" />
                  <stop offset="40%" stopColor="#0d1f3c" />
                  <stop offset="100%" stopColor="#091422" />
                </linearGradient>
                {/* Sea shimmer */}
                <radialGradient id="sea-shimmer" cx="35%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="rgba(30,80,140,0.15)" />
                  <stop offset="100%" stopColor="rgba(10,22,40,0)" />
                </radialGradient>
                {/* Neighbour land fill */}
                <linearGradient id="neighbour-land" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(40,35,30,0.9)" />
                  <stop offset="100%" stopColor="rgba(30,25,20,0.9)" />
                </linearGradient>
                {/* Wave pattern */}
                <pattern id="wave-pattern" x="0" y="0" width="120" height="24" patternUnits="userSpaceOnUse">
                  <path
                    d="M0,12 Q15,6 30,12 Q45,18 60,12 Q75,6 90,12 Q105,18 120,12"
                    fill="none"
                    stroke="rgba(40,100,180,0.08)"
                    strokeWidth="1"
                  />
                  <path
                    d="M0,20 Q15,14 30,20 Q45,26 60,20 Q75,14 90,20 Q105,26 120,20"
                    fill="none"
                    stroke="rgba(40,100,180,0.05)"
                    strokeWidth="0.8"
                  />
                </pattern>
                {/* Coastline glow */}
                <filter id="coast-glow" x="-5%" y="-5%" width="110%" height="110%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feFlood floodColor="rgba(40,120,200,0.25)" result="color" />
                  <feComposite in="color" in2="blur" operator="in" />
                </filter>
              </defs>

              {/* Background sea */}
              <rect x="-20" y="-20" width="940" height="640" fill="url(#sea-gradient)" rx="12" />
              <rect x="-20" y="-20" width="940" height="640" fill="url(#sea-shimmer)" rx="12" />
              <rect x="-20" y="-20" width="940" height="640" fill="url(#wave-pattern)" rx="12" opacity={0.6} />

              {/* Subtle sea depth contours */}
              <ellipse cx={320} cy={160} rx={200} ry={80} fill="none" stroke="rgba(30,90,160,0.06)" strokeWidth={1} />
              <ellipse cx={300} cy={150} rx={140} ry={55} fill="none" stroke="rgba(30,90,160,0.04)" strokeWidth={0.8} />

              {/* Neighbour countries — rendered behind UAE */}
              {NEIGHBOURS.map((n) => (
                <path
                  key={n.id}
                  d={n.path}
                  fill="url(#neighbour-land)"
                  stroke="rgba(60,55,45,0.6)"
                  strokeWidth={0.8}
                  strokeLinejoin="round"
                />
              ))}

              {/* Coastline highlight along neighbour borders */}
              {NEIGHBOURS.map((n) => (
                <path
                  key={`coast-${n.id}`}
                  d={n.path}
                  fill="none"
                  stroke="rgba(50,130,210,0.12)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  filter="url(#coast-glow)"
                  style={{ pointerEvents: "none" }}
                />
              ))}

              {/* Neighbour country labels */}
              {NEIGHBOURS.map((n) => (
                <text
                  key={`nlabel-${n.id}`}
                  x={n.labelX}
                  y={n.labelY}
                  textAnchor={n.labelX < 100 ? "start" : n.labelX > 800 ? "end" : "middle"}
                  fill="rgba(180,170,150,0.45)"
                  fontSize={11}
                  fontWeight={600}
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="1.5"
                  style={{ pointerEvents: "none", textTransform: "uppercase" as const }}
                >
                  {isRtl ? n.name_ar : n.name_en}
                </text>
              ))}

              {/* Sea labels */}
              <g style={{ pointerEvents: "none" }}>
                <text
                  x={320}
                  y={100}
                  textAnchor="middle"
                  fill="rgba(60,140,220,0.25)"
                  fontSize={16}
                  fontWeight={700}
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="6"
                  style={{ textTransform: "uppercase" as const }}
                >
                  {isRtl ? "الخليج العربي" : "Arabian Gulf"}
                </text>
                <text
                  x={870}
                  y={290}
                  textAnchor="end"
                  fill="rgba(60,140,220,0.2)"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="3"
                  transform="rotate(-70, 870, 290)"
                  style={{ textTransform: "uppercase" as const }}
                >
                  {isRtl ? "خليج عُمان" : "Gulf of Oman"}
                </text>
              </g>

              {/* Emirate shapes */}
              {EMIRATES.map((emirate) => {
                const isHovered = hoveredId === emirate.id;
                const isSelected = selectedId === emirate.id;
                const isActive = isHovered || isSelected;

                return (
                  <g key={emirate.id} filter={isActive ? "url(#emirate-glow)" : "url(#emirate-shadow)"}>
                    <path
                      d={emirate.path}
                      fill={isActive ? emirate.hoverColor : emirate.color}
                      stroke={isActive ? "var(--gold-light)" : emirate.strokeColor}
                      strokeWidth={isActive ? 3 : 1.5}
                      strokeLinejoin="round"
                      cursor="pointer"
                      onMouseEnter={() => setHoveredId(emirate.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => toggleSelect(emirate.id)}
                      style={{
                        transition: "fill 0.25s ease, stroke 0.25s ease, stroke-width 0.2s ease",
                      }}
                    />
                  </g>
                );
              })}

              {/* Labels */}
              {EMIRATES.map((emirate) => {
                const isActive = hoveredId === emirate.id || selectedId === emirate.id;
                const count = getEmirateCount(emirate.id);
                return (
                  <g
                    key={`label-${emirate.id}`}
                    style={{ pointerEvents: "none" }}
                  >
                    {/* Name */}
                    <text
                      x={emirate.labelX}
                      y={emirate.labelY - (count > 0 ? 8 : 0)}
                      textAnchor="middle"
                      fill={isActive ? "#FFFFFF" : "rgba(255,255,255,0.92)"}
                      fontSize={isActive ? 14 : 12}
                      fontWeight={700}
                      fontFamily="system-ui, sans-serif"
                      paintOrder="stroke"
                      stroke="rgba(3,8,15,0.7)"
                      strokeWidth={3}
                      strokeLinejoin="round"
                      style={{
                        transition: "font-size 0.15s ease, fill 0.15s ease",
                      }}
                    >
                      {isRtl ? emirate.name_ar : emirate.name_en}
                    </text>
                    {/* Count badge (only if > 0) */}
                    {count > 0 && (
                      <text
                        x={emirate.labelX}
                        y={emirate.labelY + 14}
                        textAnchor="middle"
                        fill="var(--gold-light)"
                        fontSize={11}
                        fontWeight={700}
                        fontFamily="ui-monospace, monospace"
                        paintOrder="stroke"
                        stroke="rgba(3,8,15,0.7)"
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                      >
                        {count.toLocaleString()}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Decorative compass */}
              <g transform="translate(60, 60)" opacity={0.35}>
                {/* Outer ring */}
                <circle r={22} fill="none" stroke="var(--gold)" strokeWidth={0.6} />
                <circle r={18} fill="none" stroke="var(--gold)" strokeWidth={0.3} strokeDasharray="2 4" />
                {/* Cross lines */}
                <line y1={-20} y2={20} stroke="var(--gold)" strokeWidth={0.6} />
                <line x1={-20} x2={20} stroke="var(--gold)" strokeWidth={0.6} />
                {/* Diagonal ticks */}
                <line x1={-5} y1={-5} x2={5} y2={5} stroke="var(--gold)" strokeWidth={0.3} transform="rotate(45)" />
                <line x1={-5} y1={-5} x2={5} y2={5} stroke="var(--gold)" strokeWidth={0.3} transform="rotate(-45)" />
                {/* North arrow */}
                <polygon points="0,-16 -3,-8 3,-8" fill="var(--gold)" opacity={0.8} />
                {/* Cardinal labels */}
                <text y={-26} textAnchor="middle" fill="var(--gold)" fontSize={9} fontWeight={700}>N</text>
                <text y={30} textAnchor="middle" fill="var(--gold)" fontSize={7} fontWeight={500}>S</text>
                <text x={28} y={3} textAnchor="middle" fill="var(--gold)" fontSize={7} fontWeight={500}>E</text>
                <text x={-28} y={3} textAnchor="middle" fill="var(--gold)" fontSize={7} fontWeight={500}>W</text>
                {/* Center dot */}
                <circle r={2} fill="var(--gold)" opacity={0.6} />
              </g>
            </svg>

            {/* Floating tooltip */}
            {hoveredId && tooltipPos && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{
                  left: Math.min(tooltipPos.x + 16, (containerRef.current?.clientWidth ?? 500) - 200),
                  top: Math.max(tooltipPos.y - 90, 10),
                }}
              >
                <div className="bg-[var(--card-glass-deep)] backdrop-blur-xl border border-[var(--gold-dim)] px-4 py-3 rounded-xl shadow-2xl min-w-[170px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: getShape(hoveredId)?.color }}
                    />
                    <span className="font-sans font-bold text-[var(--white)] text-sm">
                      {getEmirateName(hoveredId)}
                    </span>
                  </div>
                  <div className="font-mono text-[var(--gold)] font-bold text-lg leading-tight">
                    <span dir="ltr">{getEmirateCount(hoveredId).toLocaleString()}</span>{" "}
                    <span className="text-xs text-[var(--muted-light)] font-normal">
                      {t("messageLabel")}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${maxCount > 0 ? (getEmirateCount(hoveredId) / maxCount) * 100 : 0}%`,
                        backgroundColor: getShape(hoveredId)?.color,
                        minWidth: getEmirateCount(hoveredId) > 0 ? "8px" : "0",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Legend — hidden on mobile, shown overlaid on md+ */}
            <div className="hidden md:block absolute bottom-4 end-4 bg-[var(--card-glass-deep)] backdrop-blur-md border border-[var(--border)] rounded-xl p-3 z-20">
              <div className="text-[var(--muted-light)] text-[10px] font-bold uppercase tracking-wider mb-2">
                {isRtl ? "الإمارات" : "Emirates"}
              </div>
              <div className="flex flex-col gap-1.5">
                {EMIRATES.map((e) => (
                  <button
                    key={e.id}
                    className="flex items-center gap-2 text-start hover:opacity-80 transition-opacity"
                    onClick={() => toggleSelect(e.id)}
                    onMouseEnter={() => setHoveredId(e.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0 transition-all"
                      style={{
                        backgroundColor: e.color,
                        outline: selectedId === e.id ? "2px solid var(--white)" : "none",
                        outlineOffset: 1,
                      }}
                    />
                    <span
                      className="text-xs transition-colors"
                      style={{
                        color: selectedId === e.id || hoveredId === e.id ? "var(--white)" : "var(--muted)",
                        fontWeight: selectedId === e.id ? 700 : 400,
                      }}
                    >
                      {isRtl ? e.name_ar : e.name_en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legend — mobile only, shown inline below the map */}
          <div className="md:hidden bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
            <div className="text-[var(--muted-light)] text-[10px] font-bold uppercase tracking-wider mb-3">
              {isRtl ? "الإمارات" : "Emirates"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EMIRATES.map((e) => (
                <button
                  key={`m-${e.id}`}
                  className="flex items-center gap-2 text-start p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                  onClick={() => toggleSelect(e.id)}
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: e.color,
                      outline: selectedId === e.id ? "2px solid var(--white)" : "none",
                      outlineOffset: 1,
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: selectedId === e.id ? "var(--white)" : "var(--muted)",
                      fontWeight: selectedId === e.id ? 700 : 400,
                    }}
                  >
                    {isRtl ? e.name_ar : e.name_en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ========== SIDEBAR ========== */}
          <div className="xl:col-span-1 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 flex flex-col text-start">
            <h3 className="font-sans font-bold text-2xl text-[var(--white)] mb-6">
              {t("emiratesParticipation")}
            </h3>
            <div className={`flex-1 overflow-y-auto space-y-3 ${isRtl ? "pl-2" : "pr-2"}`}>
              {emirates.map((emirate, idx) => {
                const shape = getShape(emirate.id);
                const isActive = selectedId === emirate.id || hoveredId === emirate.id;
                return (
                  <button
                    key={emirate.id}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-start ${
                      isActive
                        ? "ring-1 ring-[var(--gold)] bg-[var(--gold-dim)]"
                        : "hover:bg-[var(--surface-2)]"
                    }`}
                    onClick={() => toggleSelect(emirate.id)}
                    onMouseEnter={() => setHoveredId(emirate.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Rank badge */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-transform duration-200"
                      style={{
                        backgroundColor: shape?.color ?? "var(--surface-2)",
                        color: "#fff",
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Name + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-bold text-[var(--white)] text-sm mb-1.5 truncate">
                        {isRtl ? emirate.name_ar : emirate.name_en}
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${maxCount > 0 ? (emirate.count / maxCount) * 100 : 0}%`,
                            backgroundColor: shape?.color ?? "var(--gold)",
                            minWidth: emirate.count > 0 ? "6px" : "0",
                            transition: "width 0.5s ease-out",
                          }}
                        />
                      </div>
                    </div>

                    {/* Count */}
                    <div
                      className="font-mono text-sm font-bold text-end flex-shrink-0 transition-colors"
                      dir="ltr"
                      style={{ color: shape?.color ?? "var(--muted-light)" }}
                    >
                      {emirate.count.toLocaleString()}
                    </div>
                  </button>
                );
              })}
              {emirates.length > 0 && emirates.every((e) => e.count === 0) && (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  {t("noParticipations")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
