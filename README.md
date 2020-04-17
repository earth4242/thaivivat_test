# Parking System
โปรแกรมนี้จัดทำเพื่อทดสอบระบบลานจอดรถ
* เคลียร์พอร์ต 3000 และ 27017 สำหรับการทดสอบระบบ

**Installation**
```
$ docker-compose up
```

**Description**<br />
ตรวจสอบสถานะลานจอดได้ที่ **Get Parking Status**
* lotsize - จำนวนรถยนต์ที่สามารถรองรับได้
* lasted_slot - slot number ล่าสุดที่รถยนต์เข้ามาใช้งาน
* available - จำนวนรถยนต์ที่จอดอยู่
* entry_amount - จำนวนรถยนต์ที่เคยเข้ามาใช้งานทั้งหมด
* exit_amount - จำนวนรถยนต์ที่ออกจากลานจอดรถทั้งหมด

สามารถกำหนดขนาดพื้นที่จอดรถว่าสมารถจอดรถได้กี่คันได้ที่ **Create Parking lot** ( ปรับเปลี่ยนได้ >= lasted_slot )

ลงทะเบียนรถยนต์ที่ **Park The Car** โดยใส่รายละเอียด Plat Number และกำหนด Size

ออกจากลานจอดรถที่ **Leave The Slot** โดยใส่รายละเอียด Plat Number

ตรวจสอบรายการรถยนต์ที่เข้า-ออกลานจอดรถที่ **Get Registration List (by carsize)** โดยการกำหนด Size

ตรวจสอบรายการรถยนต์ที่ใช้งานอยู่ที่ **Get Allocated Slot (by carsize)** โดยการกำหนด Size

เคลียร์ฐานข้อมูลทั้งหมดที่ **Reset System**
