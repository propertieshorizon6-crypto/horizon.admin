import { useEffect, useRef, useState } from "react";

export const COUNTRY_CODES = [
  { code:"+260", flag:"🇿🇲", name:"Zambia"               },
  { code:"+263", flag:"🇿🇼", name:"Zimbabwe"             },
  { code:"+27",  flag:"🇿🇦", name:"South Africa"         },
  { code:"+254", flag:"🇰🇪", name:"Kenya"                },
  { code:"+255", flag:"🇹🇿", name:"Tanzania"             },
  { code:"+256", flag:"🇺🇬", name:"Uganda"               },
  { code:"+265", flag:"🇲🇼", name:"Malawi"               },
  { code:"+258", flag:"🇲🇿", name:"Mozambique"           },
  { code:"+267", flag:"🇧🇼", name:"Botswana"             },
  { code:"+264", flag:"🇳🇦", name:"Namibia"              },
  { code:"+243", flag:"🇨🇩", name:"DR Congo"             },
  { code:"+244", flag:"🇦🇴", name:"Angola"               },
  { code:"+233", flag:"🇬🇭", name:"Ghana"                },
  { code:"+234", flag:"🇳🇬", name:"Nigeria"              },
  { code:"+251", flag:"🇪🇹", name:"Ethiopia"             },
  { code:"+250", flag:"🇷🇼", name:"Rwanda"               },
  { code:"+211", flag:"🇸🇸", name:"South Sudan"          },
  { code:"+249", flag:"🇸🇩", name:"Sudan"                },
  { code:"+237", flag:"🇨🇲", name:"Cameroon"             },
  { code:"+225", flag:"🇨🇮", name:"Côte d'Ivoire"        },
  { code:"+221", flag:"🇸🇳", name:"Senegal"              },
  { code:"+212", flag:"🇲🇦", name:"Morocco"              },
  { code:"+213", flag:"🇩🇿", name:"Algeria"              },
  { code:"+216", flag:"🇹🇳", name:"Tunisia"              },
  { code:"+20",  flag:"🇪🇬", name:"Egypt"                },
  { code:"+252", flag:"🇸🇴", name:"Somalia"              },
  { code:"+253", flag:"🇩🇯", name:"Djibouti"             },
  { code:"+257", flag:"🇧🇮", name:"Burundi"              },
  { code:"+236", flag:"🇨🇫", name:"Central African Rep." },
  { code:"+241", flag:"🇬🇦", name:"Gabon"                },
  { code:"+242", flag:"🇨🇬", name:"Congo"                },
  { code:"+245", flag:"🇬🇼", name:"Guinea-Bissau"        },
  { code:"+240", flag:"🇬🇶", name:"Equatorial Guinea"    },
  { code:"+238", flag:"🇨🇻", name:"Cape Verde"           },
  { code:"+232", flag:"🇸🇱", name:"Sierra Leone"         },
  { code:"+231", flag:"🇱🇷", name:"Liberia"              },
  { code:"+224", flag:"🇬🇳", name:"Guinea"               },
  { code:"+223", flag:"🇲🇱", name:"Mali"                 },
  { code:"+222", flag:"🇲🇷", name:"Mauritania"           },
  { code:"+220", flag:"🇬🇲", name:"Gambia"               },
  { code:"+218", flag:"🇱🇾", name:"Libya"                },
  { code:"+230", flag:"🇲🇺", name:"Mauritius"            },
  { code:"+261", flag:"🇲🇬", name:"Madagascar"           },
  { code:"+268", flag:"🇸🇿", name:"Eswatini"             },
  { code:"+266", flag:"🇱🇸", name:"Lesotho"              },
  { code:"+1",   flag:"🇺🇸", name:"USA / Canada"         },
  { code:"+44",  flag:"🇬🇧", name:"United Kingdom"       },
  { code:"+33",  flag:"🇫🇷", name:"France"               },
  { code:"+49",  flag:"🇩🇪", name:"Germany"              },
  { code:"+39",  flag:"🇮🇹", name:"Italy"                },
  { code:"+34",  flag:"🇪🇸", name:"Spain"                },
  { code:"+31",  flag:"🇳🇱", name:"Netherlands"          },
  { code:"+32",  flag:"🇧🇪", name:"Belgium"              },
  { code:"+41",  flag:"🇨🇭", name:"Switzerland"          },
  { code:"+46",  flag:"🇸🇪", name:"Sweden"               },
  { code:"+47",  flag:"🇳🇴", name:"Norway"               },
  { code:"+45",  flag:"🇩🇰", name:"Denmark"              },
  { code:"+358", flag:"🇫🇮", name:"Finland"              },
  { code:"+48",  flag:"🇵🇱", name:"Poland"               },
  { code:"+7",   flag:"🇷🇺", name:"Russia"               },
  { code:"+380", flag:"🇺🇦", name:"Ukraine"              },
  { code:"+971", flag:"🇦🇪", name:"UAE"                  },
  { code:"+966", flag:"🇸🇦", name:"Saudi Arabia"         },
  { code:"+974", flag:"🇶🇦", name:"Qatar"                },
  { code:"+965", flag:"🇰🇼", name:"Kuwait"               },
  { code:"+973", flag:"🇧🇭", name:"Bahrain"              },
  { code:"+968", flag:"🇴🇲", name:"Oman"                 },
  { code:"+972", flag:"🇮🇱", name:"Israel"               },
  { code:"+90",  flag:"🇹🇷", name:"Turkey"               },
  { code:"+91",  flag:"🇮🇳", name:"India"                },
  { code:"+92",  flag:"🇵🇰", name:"Pakistan"             },
  { code:"+880", flag:"🇧🇩", name:"Bangladesh"           },
  { code:"+94",  flag:"🇱🇰", name:"Sri Lanka"            },
  { code:"+977", flag:"🇳🇵", name:"Nepal"                },
  { code:"+86",  flag:"🇨🇳", name:"China"                },
  { code:"+81",  flag:"🇯🇵", name:"Japan"                },
  { code:"+82",  flag:"🇰🇷", name:"South Korea"          },
  { code:"+65",  flag:"🇸🇬", name:"Singapore"            },
  { code:"+60",  flag:"🇲🇾", name:"Malaysia"             },
  { code:"+62",  flag:"🇮🇩", name:"Indonesia"            },
  { code:"+63",  flag:"🇵🇭", name:"Philippines"          },
  { code:"+66",  flag:"🇹🇭", name:"Thailand"             },
  { code:"+84",  flag:"🇻🇳", name:"Vietnam"              },
  { code:"+61",  flag:"🇦🇺", name:"Australia"            },
  { code:"+64",  flag:"🇳🇿", name:"New Zealand"          },
  { code:"+55",  flag:"🇧🇷", name:"Brazil"               },
  { code:"+54",  flag:"🇦🇷", name:"Argentina"            },
  { code:"+52",  flag:"🇲🇽", name:"Mexico"               },
  { code:"+57",  flag:"🇨🇴", name:"Colombia"             },
  { code:"+56",  flag:"🇨🇱", name:"Chile"                },
  { code:"+51",  flag:"🇵🇪", name:"Peru"                 },
];

export default function PhoneInput({ countryCode, number, onCodeChange, onNumberChange, placeholder, hasError }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  const selected = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0];
  const filtered = search.trim()
    ? COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : COUNTRY_CODES;

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ display:"flex", borderRadius:8, border:`1px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`, overflow:"visible", background:"#fff", position:"relative" }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(""); }}
        style={{ flexShrink:0, display:"flex", alignItems:"center", gap:4, border:"none", borderRight:"1px solid #e2e8f0", padding:"10px 10px", background:"#f8fafc", cursor:"pointer", fontSize:13, color:"#000000", borderRadius:"8px 0 0 8px", outline:"none", whiteSpace:"nowrap" }}
      >
        <span style={{ fontSize:16 }}>{selected.flag}</span>
        <span style={{ fontWeight:600 }}>{selected.code}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ marginLeft:2, transition:"transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:9999, background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", width:260, overflow:"hidden" }}>
          <div style={{ padding:"8px 10px", borderBottom:"1px solid #f1f5f9" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code..."
              style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #e2e8f0", fontSize:12, color:"#000000", outline:"none", boxSizing:"border-box" }}
            />
          </div>
          <div style={{ maxHeight:220, overflowY:"auto" }}>
            {filtered.length === 0 && (
              <p style={{ margin:0, padding:"12px", fontSize:12, color:"#94a3b8", textAlign:"center" }}>No results</p>
            )}
            {filtered.map(c => (
              <button
                key={c.code + c.name}
                type="button"
                onClick={() => { onCodeChange(c.code); setOpen(false); setSearch(""); }}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 12px", border:"none", background: c.code === countryCode ? "#f1f5f9" : "#fff", cursor:"pointer", fontSize:12, color:"#000000", textAlign:"left" }}
                onMouseEnter={e => { if (c.code !== countryCode) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (c.code !== countryCode) e.currentTarget.style.background = "#fff"; }}
              >
                <span style={{ fontSize:16, flexShrink:0 }}>{c.flag}</span>
                <span style={{ fontWeight:600, flexShrink:0 }}>{c.code}</span>
                <span style={{ color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={number}
        onChange={e => onNumberChange(e.target.value.replace(/\D/g, ""))}
        onWheel={e => e.currentTarget.blur()}
        placeholder={placeholder}
        style={{ flex:1, border:"none", padding:"10px 12px", fontSize:13, color:"#000000", outline:"none", background:"#fff", minWidth:0, borderRadius:"0 8px 8px 0" }}
      />
    </div>
  );
}
