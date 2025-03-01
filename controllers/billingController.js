import Bill from '../models/Bill.js';

export const getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find();
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createBill = async (req, res) => {
    try {
        const newBill = await Bill.create(req.body);
        res.status(201).json(newBill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBill = async (req, res) => {
    try {
        const updatedBill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json(updatedBill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBill = async (req, res) => {
    try {
        const deletedBill = await Bill.findByIdAndDelete(req.params.id);
        if (!deletedBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json({ message: 'Bill deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
