const exposes = require("zigbee-herdsman-converters/lib/exposes");
const tuya = require("zigbee-herdsman-converters/lib/tuya");

const e = exposes.presets;
const ea = exposes.access;
module.exports = {
        fingerprint: tuya.fingerprint("TS0601", ["_TZE204_bvfld3xc","_TZE284_bvfld3xc"]),
        model: "ZY-ZHPS01-24G",
        vendor: "Tuya",
        description: "24GHz mmWave human presence sensor",
        extend: [
            tuya.modernExtend.tuyaBase({dp: true}),
            m.poll({
                key: "dis_current",
                optionKey: "measurement_poll_interval",
                defaultIntervalSeconds: 60,
                option: exposes.options.measurement_poll_interval(),
                poll: async (device: Zh.Device) => {
                    await device.getEndpoint(1).command("manuSpecificTuya", "dataQuery", {});
                },
            }),
        ],
        exposes: [
            e.presence(),
            e.illuminance(),
            e.numeric("dis_current", ea.STATE).withUnit("cm").withDescription("Current detection distance"),
            e.numeric("presence_delay", ea.STATE_SET).withUnit("s").withValueMin(1).withValueMax(600).withDescription("Presence delay"),
            e.numeric("movesensitivity", ea.STATE_SET).withValueMin(0).withValueMax(10).withDescription("Move sensitivity"),
            e.numeric("breathsensitivity", ea.STATE_SET).withValueMin(0).withValueMax(10).withDescription("Breath sensitivity"),
            e
                .numeric("movedistance_max", ea.STATE_SET)
                .withUnit("cm")
                .withValueMin(0)
                .withValueMax(600)
                .withDescription("Move detection max distance"),
            e
                .numeric("movedistance_min", ea.STATE_SET)
                .withUnit("cm")
                .withValueMin(0)
                .withValueMax(600)
                .withDescription("Move detection min distance"),
            e
                .numeric("breathdistance_max", ea.STATE_SET)
                .withUnit("cm")
                .withValueMin(0)
                .withValueMax(600)
                .withDescription("Breath detection max distance"),
            e
                .numeric("breathdistance_min", ea.STATE_SET)
                .withUnit("cm")
                .withValueMin(0)
                .withValueMax(600)
                .withDescription("Breath detection min distance"),
            e.enum("self_learning", ea.STATE_SET, ["start", "stop"]).withDescription("Self learning mode"),
            e.binary("restore_factory_setting", ea.STATE_SET, true, false).withDescription("Factory reset (behavior depends on firmware)"),
        ],
        meta: {
            tuyaDatapoints: [
                [
                    101,
                    "presence",
                    {
                        from: (v: Buffer | number) => {
                            // DP101 is inverted: [0]=presence detected, [1]=no presence
                            if (Buffer.isBuffer(v)) return v[0] === 0;
                            return v === 0;
                        },
                    },
                ],
                [12, "illuminance", tuya.valueConverter.raw],
                // DP102 requires periodic dataQuery to maintain reporting (see disCurrentPoll)
                [102, "dis_current", {from: (v: Buffer | number) => (Buffer.isBuffer(v) ? v.readUInt32BE(0) : v)}],
                [103, "presence_delay", tuya.valueConverter.raw],
                [105, "movesensitivity", tuya.valueConverter.raw],
                [107, "breathsensitivity", tuya.valueConverter.raw],
                [109, "movedistance_max", tuya.valueConverter.raw],
                [110, "movedistance_min", tuya.valueConverter.raw],
                [111, "breathdistance_max", tuya.valueConverter.raw],
                [112, "breathdistance_min", tuya.valueConverter.raw],
                [116, "self_learning", tuya.valueConverterBasic.lookup({start: tuya.enum(0), stop: tuya.enum(1)})],
                [117, "restore_factory_setting", tuya.valueConverter.raw],
            ],
        },
    },