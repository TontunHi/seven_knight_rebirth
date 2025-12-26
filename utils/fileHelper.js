const fs = require('fs');
const path = require('path');

// 1. กำหนดน้ำหนักของ Grade แต่ละประเภท
const heroGradeWeight = { 'l++': 4, 'l+': 3, 'l': 2, 'r': 1 };
const petGradeWeight = { 'l': 2, 'r': 1 };
// เพิ่มน้ำหนักสำหรับ Items (Accessory/Weapon/Armor)
const itemGradeWeight = { 'l': 4, 'r': 3, 'un': 2, 'c': 1 };

// Helper: แยก Grade และ Name (สำหรับ Hero/Pet)
const getGradeAndName = (filename) => {
    const parts = filename.split('_');
    const grade = parts[0]; 
    const nameWithExt = parts.slice(1).join('_'); 
    const name = nameWithExt.replace(/\.[^/.]+$/, "");
    
    return { grade, name, filename };
};

// Function 1: ดึงรูปภาพ Hero/Pet (มี Logic เฉพาะ)
const getSortedImages = (folderName) => {
    const dirPath = path.join(__dirname, '../public/images', folderName);
    
    if (!fs.existsSync(dirPath)) return [];

    const files = fs.readdirSync(dirPath);
    const isHero = folderName === 'heroes';

    const items = files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file)).map(file => {
        return getGradeAndName(file);
    });

    // Sort Logic
    items.sort((a, b) => {
        const weightA = isHero ? (heroGradeWeight[a.grade] || 0) : (petGradeWeight[a.grade] || 0);
        const weightB = isHero ? (heroGradeWeight[b.grade] || 0) : (petGradeWeight[b.grade] || 0);

        if (weightB !== weightA) return weightB - weightA;
        return a.name.localeCompare(b.name);
    });

    return items;
};

// Function 2: ดึงรูปภาพ Items (Weapon/Armor/Accessory) และเรียงตาม Grade
const getImageFiles = (folderPath) => {
    const dirPath = path.join(__dirname, '../public/images', folderPath);
    
    if (!fs.existsSync(dirPath)) {
        console.warn(`Directory not found: ${dirPath}`);
        return [];
    }

    const files = fs.readdirSync(dirPath);
    const images = files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));

    // Sort Logic (L > R > UN > C > Others)
    images.sort((a, b) => {
        const getInfo = (filename) => {
            const parts = filename.split('_');
            const grade = parts[0].toLowerCase();
            const weight = itemGradeWeight[grade] !== undefined ? itemGradeWeight[grade] : -1;
            let name = parts.slice(1).join('_').replace(/\.[^/.]+$/, "").toLowerCase();
            if (!name) name = filename.replace(/\.[^/.]+$/, "").toLowerCase();
            return { weight, name };
        };

        const infoA = getInfo(a);
        const infoB = getInfo(b);

        if (infoA.weight !== infoB.weight) {
            return infoB.weight - infoA.weight;
        }
        return infoA.name.localeCompare(infoB.name);
    });

    return images;
};

// Helper: จัดรูปแบบชื่อ Hero (ตัด l++_ ออกและทำตัวพิมพ์ใหญ่)
const formatHeroName = (filename) => {
    if (!filename) return '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExt.split('_');
    const cleanName = parts.length > 1 ? parts[parts.length - 1] : nameWithoutExt;
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
};

// Function 3: อ่านไฟล์ทั้งหมดในโฟลเดอร์ (ใช้สำหรับ Dropdown เลือกรูปใน Admin)
const getFilesFromDir = (dirPath) => {
    const fullPath = path.join(__dirname, '../public', dirPath);
    if (!fs.existsSync(fullPath)) return [];
    
    return fs.readdirSync(fullPath).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
};

// [NEW] Function 4: อ่านรูป Skill จากโฟลเดอร์ย่อย (สำหรับ Codex)
const getSkillImages = (heroSkillFolder) => {
    if (!heroSkillFolder) return [];
    
    // Path: public/images/skill/{ชื่อโฟลเดอร์}
    const skillPath = path.join(__dirname, '../public/images/skill', heroSkillFolder);
    
    if (fs.existsSync(skillPath)) {
        // อ่านไฟล์รูปทั้งหมดในโฟลเดอร์ skill นั้น
        return fs.readdirSync(skillPath)
            .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
            .sort(); // เรียงชื่อไฟล์ (1.png, 2.png, ...)
    }
    return [];
};

module.exports = {
    getGradeAndName,
    getSortedImages,
    getImageFiles,
    formatHeroName,
    getFilesFromDir,
    getSkillImages
};