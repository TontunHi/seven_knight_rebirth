const db = require('../database/database'); // ตรวจสอบ path database ให้ถูกต้อง
const { formatHeroName, getFilesFromDir } = require('../utils/fileHelper'); // เรียกใช้ Helper

// แสดงหน้าจัดการ Hero Codex
exports.getIndex = (req, res) => {
    // 1. ดึงข้อมูล Category ทั้งหมด
    db.all("SELECT * FROM codex_categories WHERE type = 'hero'", [], (err, categories) => {
        if (err) { console.error(err); return res.send("DB Error: Categories"); }

        // 2. ดึงข้อมูล Group ย่อยทั้งหมด
        db.all("SELECT * FROM codex_groups", [], (err, groups) => {
            if (err) { console.error(err); return res.send("DB Error: Groups"); }

            // 3. ดึงข้อมูล Heroes ทั้งหมด
            db.all("SELECT * FROM codex_heroes", [], (err, heroes) => {
                if (err) { console.error(err); return res.send("DB Error: Heroes"); }

                // 4. อ่านไฟล์รูปทั้งหมดในโฟลเดอร์ heroes
                const availableImages = getFilesFromDir('images/heroes');

                // [UPDATE START] เพิ่ม title เข้าไปใน object นี้ครับ
                res.render('pages/admin/codex_hero_manager', {
                    title: 'จัดการข้อมูล Hero Codex', // <--- เพิ่มบรรทัดนี้ครับ
                    categories: categories,
                    groups: groups,
                    heroes: heroes,
                    availableHeroImages: availableImages,
                    user: req.session ? req.session.user : null 
                });
                // [UPDATE END]
            });
        });
    });
};

// [POST] เพิ่มหมวดหมู่ใหญ่ (Category)
exports.addCategory = (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO codex_categories (name, type) VALUES (?, 'hero')", [name], (err) => {
        if (err) console.error(err);
        res.redirect('/admin/codex/hero');
    });
};

// [POST] เพิ่มกลุ่มย่อย (Group)
exports.addGroup = (req, res) => {
    const { category_id, name } = req.body;
    db.run("INSERT INTO codex_groups (category_id, name) VALUES (?, ?)", [category_id, name], (err) => {
        if (err) console.error(err);
        res.redirect('/admin/codex/hero');
    });
};

// [POST] เพิ่ม Hero ใหม่
exports.addHero = (req, res) => {
    const { group_id, image_name, skill_folder } = req.body;
    // ใช้ Helper ตัดชื่อให้สวยงาม (เช่น l++_colt.png -> Colt)
    const cleanName = formatHeroName(image_name); 

    db.run("INSERT INTO codex_heroes (group_id, name, image_name, skill_folder) VALUES (?, ?, ?, ?)", 
        [group_id, cleanName, image_name, skill_folder], 
        (err) => {
            if (err) console.error(err);
            res.redirect('/admin/codex/hero');
        }
    );
};

// [GET] ลบ Hero
exports.deleteHero = (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM codex_heroes WHERE id = ?", [id], (err) => {
        if (err) console.error(err);
        res.redirect('/admin/codex/hero');
    });
};

exports.getHeroManager = async (req, res) => {
    try {
        // สมมติว่ามีการดึงข้อมูล heroes มาจาก Model
        // const heroes = await HeroModel.findAll(); 

        // [UPDATE START] แก้ไขส่วน res.render
        res.render('pages/admin/codex_hero_manager', {
            title: 'Hero Codex Manager',  // <--- เพิ่มบรรทัดนี้ครับ (ใส่ชื่อ Title ที่ต้องการแสดงบน Tab Browser)
            // heroes: heroes,                 // <--- ตัวแปรข้อมูลเดิมที่มีอยู่แล้ว อย่าลบออกนะครับ
            // layout: 'admin_layout'          // <--- ถ้ามี layout
        });
        // [UPDATE END]

    } catch (error) {
        console.error('Error fetching hero codex:', error);
        res.status(500).send('Server Error');
    }
};