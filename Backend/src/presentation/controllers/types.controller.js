const { getTypesService } = require("../../shared/serviceFactory");

const typesService = getTypesService();

exports.getEssayTypes = async (req, res) => {
    try {
        const types = await typesService.getEssayTypes();
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEssayType = async (req, res) => {
    try {
        const { type, created } = await typesService.createEssayType(req.body?.name);
        res.status(created ? 201 : 200).json(type);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.getCountries = async (req, res) => {
    try {
        const countries = await typesService.getCountries();
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDistricts = async (req, res) => {
    try {
        const districts = await typesService.getDistricts();
        res.json(districts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};