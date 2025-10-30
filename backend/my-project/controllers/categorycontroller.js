const Category=require('../models/categorymodal')




const add_category= async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exist = await Category.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({ message: "Category created successfully", category });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}


const allCategories= async (req, res) => {
  try {
    const allcategories = await Category.find();

    if (!allcategories || allcategories.length === 0) {
      return res.status(404).json({ message: "No Categories Exist" });
    }

    res.status(200).json(allcategories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports={add_category,allCategories};