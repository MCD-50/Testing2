const mongoose = require("mongoose");

import appFactoryHelper from "../app/helper/appFactoryHelper";

const schema = {
	accountAddress: {
		type: String,
		unique: true,
	},
	currencyType: {
		type: String,
	},
	amount: {
		type: Number,
		default: 0
	},
	etherAmount: {
		type: Number,
		default: 0
	},

	"ADIAmount": { type: Number, default: 0 },
	"WTCAmount": { type: Number, default: 0 },
	"BNTAmount": { type: Number, default: 0 },
	"LALAAmount": { type: Number, default: 0 },
	"PAYAmount": { type: Number, default: 0 },
	"WISHAmount": { type: Number, default: 0 },
	"VZTAmount": { type: Number, default: 0 },
	"PGTSAmount": { type: Number, default: 0 },
	"PRIXAmount": { type: Number, default: 0 },
	"XNKAmount": { type: Number, default: 0 },
	"NPXSAmount": { type: Number, default: 0 },
	"BWTAmount": { type: Number, default: 0 },
	"GUSDAmount": { type: Number, default: 0 },
	"SUBAmount": { type: Number, default: 0 },
	"POEAmount": { type: Number, default: 0 },
	"OMGAmount": { type: Number, default: 0 },
	"CVCAmount": { type: Number, default: 0 },
	"SUREAmount": { type: Number, default: 0 },
	"HGTAmount": { type: Number, default: 0 },
	"PASSAmount": { type: Number, default: 0 },
	"TUSDAmount": { type: Number, default: 0 },
	"USDCAmount": { type: Number, default: 0 },
	"GATAmount": { type: Number, default: 0 },
	"INDAmount": { type: Number, default: 0 },
	"ENJAmount": { type: Number, default: 0 },
	"KNCAmount": { type: Number, default: 0 },
	"FXTAmount": { type: Number, default: 0 },
	"GVTAmount": { type: Number, default: 0 },
	"LTOAmount": { type: Number, default: 0 },
	"MRKAmount": { type: Number, default: 0 },
	"CFTAmount": { type: Number, default: 0 },
	"BLZAmount": { type: Number, default: 0 },
	"CREDAmount": { type: Number, default: 0 },
	"SPIKEAmount": { type: Number, default: 0 },
	"COSSAmount": { type: Number, default: 0 },
	"SNMAmount": { type: Number, default: 0 },
	"DRGNAmount": { type: Number, default: 0 },
	"QNTAmount": { type: Number, default: 0 },
	"UBCAmount": { type: Number, default: 0 },
	"LINKAmount": { type: Number, default: 0 },
	"FDXAmount": { type: Number, default: 0 },
	"UFRAmount": { type: Number, default: 0 },
	"AGIAmount": { type: Number, default: 0 },
	"MANAAmount": { type: Number, default: 0 },
	"KICKAmount": { type: Number, default: 0 },
	"UBTAmount": { type: Number, default: 0 },
	"COSAmount": { type: Number, default: 0 },
	"XDCEAmount": { type: Number, default: 0 },
	"DAIAmount": { type: Number, default: 0 },
	"ETHOSAmount": { type: Number, default: 0 },
	"CSAmount": { type: Number, default: 0 },
	"MOREAmount": { type: Number, default: 0 },
	"TIGAmount": { type: Number, default: 0 },
	"LAAmount": { type: Number, default: 0 },
	"MKRAmount": { type: Number, default: 0 },
	"CELTAmount": { type: Number, default: 0 },
	"BATAmount": { type: Number, default: 0 },
	"DATAmount": { type: Number, default: 0 },
	"LEOAmount": { type: Number, default: 0 },
	"JETAmount": { type: Number, default: 0 },
	"MCOAmount": { type: Number, default: 0 },
	"LRCAmount": { type: Number, default: 0 },
	"REQAmount": { type: Number, default: 0 },
	"STORJAmount": { type: Number, default: 0 },
	"H2OAmount": { type: Number, default: 0 },
	"FRVAmount": { type: Number, default: 0 },
	"TAASAmount": { type: Number, default: 0 },
	"MODAmount": { type: Number, default: 0 },
	"SMDXAmount": { type: Number, default: 0 },
	"TEUAmount": { type: Number, default: 0 },
	"DDFAmount": { type: Number, default: 0 },
	"CANAmount": { type: Number, default: 0 },
	"FYNAmount": { type: Number, default: 0 },
	"ITTAmount": { type: Number, default: 0 },
	"KINAmount": { type: Number, default: 0 },
	"LANAmount": { type: Number, default: 0 },
	"NOXAmount": { type: Number, default: 0 },
	"PGTAmount": { type: Number, default: 0 },
	"PIXAmount": { type: Number, default: 0 },
	"SENCAmount": { type: Number, default: 0 },
	"STXAmount": { type: Number, default: 0 },
	"TRAKAmount": { type: Number, default: 0 },
	"OPQAmount": { type: Number, default: 0 },
	"VENAmount": { type: Number, default: 0 },
	"QTUMAmount": { type: Number, default: 0 },
	"EOSAmount": { type: Number, default: 0 },
	"ICXAmount": { type: Number, default: 0 },


	privateKey: {
		type: String,
		default: ""
	},
	fetched: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
};

const initSchema = (app) => {
	const _schema = new mongoose.Schema(schema);
	// setup plugins
	_schema.plugin(require("./plugins/paging"));
	// setup indexes
	appFactoryHelper.addInstance("coin", app.mongoClient.model("coins", _schema));
};

export default initSchema;
