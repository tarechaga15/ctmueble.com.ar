const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Persons = sequelize.define("persons", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country_code: {
    type: DataTypes.CHAR(3),
    allowNull: true,
    references: {
      model: "Countries",
      key: "country_code"
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  district: {
    type: DataTypes.CHAR(6),
    references: {
      model: "Districts",
      key: "id"
    },
    allowNull: true
  },
  country: {
    type: DataTypes.CHAR(2),
    references: {
      model: "Countries",
      key: "id"
    },
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    unique: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  origin: {
    type: DataTypes.ENUM('CLIENT', 'LABORATORY', 'PUBLIC'),
    allowNull: true
  },
  is_third_party: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  // 👇 Opciones del modelo van acá
  timestamps: false,          // habilita timestamps
  createdAt: false,   // renombra createdAt
  updatedAt: false           // deshabilita updatedAt
});

Persons.prototype.toJSON = function () {
  const values = { ...this.get() };

  // Si existe la relación 'countryData', reemplazamos la columna 'country'
  if (values.countryData) {
    values.country = values.countryData; // remplaza el valor plano por el objeto
    delete values.countryData;
  }
  if (values.districtData) {
    values.district = values.districtData; // remplaza el valor plano por el objeto
    delete values.districtData;
  }

  return values;
};
module.exports = Persons;
