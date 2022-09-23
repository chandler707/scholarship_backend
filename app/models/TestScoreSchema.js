var mongoose = require("mongoose");
var schema = mongoose.Schema;

var test = new schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },

    ielts_score: { type: String, default: "" },
    ielts_pass_year: { type: String, default: "" },
    ielts_pass_date: { type: String, default: "" },
    ielts_marksheet: { type: String, default: "" },

    gre_score: { type: String, default: "" },
    gre_pass_year: { type: String, default: "" },
    gre_pass_date: { type: String, default: "" },
    gre_marksheet: { type: String, default: "" },

    gmat_score: { type: String, default: "" },
    gmat_pass_year: { type: String, default: "" },
    gmat_pass_date: { type: String, default: "" },
    gmat_marksheet: { type: String, default: "" },

    testas_score: { type: String, default: "" },
    testas_pass_year: { type: String, default: "" },
    testas_pass_date: { type: String, default: "" },
    testas_marksheet: { type: String, default: "" },

    neet_score: { type: String, default: "" },
    neet_pass_year: { type: String, default: "" },
    neet_pass_date: { type: String, default: "" },
    neet_marksheet: { type: String, default: "" },

    iit_mains_score: { type: String, default: "" },
    iit_mains_pass_year: { type: String, default: "" },
    iit_mains_pass_date: { type: String, default: "" },
    iit_mains_marksheet: { type: String, default: "" },

    iit_advance_score: { type: String, default: "" },
    iit_advance_pass_year: { type: String, default: "" },
    iit_advance_pass_date: { type: String, default: "" },
    iit_advance_marksheet: { type: String, default: "" },

    a1_score: { type: String, default: "" },
    a1_pass_year: { type: String, default: "" },
    a1_pass_date: { type: String, default: "" },
    a1_certificate: { type: String, default: "" },

    a2_score: { type: String, default: "" },
    a2_pass_year: { type: String, default: "" },
    a2_pass_date: { type: String, default: "" },
    a2_certificate: { type: String, default: "" },

    b1_score: { type: String, default: "" },
    b1_pass_year: { type: String, default: "" },
    b1_pass_date: { type: String, default: "" },
    b1_certificate: { type: String, default: "" },

    b2_score: { type: String, default: "" },
    b2_pass_year: { type: String, default: "" },
    b2_pass_date: { type: String, default: "" },
    b2_certificate: { type: String, default: "" },

    c1_score: { type: String, default: "" },
    c1_pass_year: { type: String, default: "" },
    c1_pass_date: { type: String, default: "" },
    c1_certificate: { type: String, default: "" },

    c2_score: { type: String, default: "" },
    c2_pass_year: { type: String, default: "" },
    c2_pass_date: { type: String, default: "" },
    c2_certificate: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var TestScore = mongoose.model("test_score", test);

module.exports = {
  TestScore,
};
