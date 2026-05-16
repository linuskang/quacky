"use client";

// ─── Theme — edit here to restyle the entire bag ─────────────────────────────
export const BAG = {
    body:        "#C47838",   // main kraft colour
    bodyLight:   "#D9924A",   // left-edge highlight
    bodyDark:    "#9A5C20",   // right-edge shadow
    flap:        "#8B5220",   // top flap
    flapCrease:  "#C47838",   // crease highlight on closed flap
    label:       "#E8B250",   // front label background
    labelBorder: "#7A4510",   // front label border
    labelText:   "#5C3000",   // "warm fuzzies" text on label
    outline:     "#3D2008",   // global outline colour
    badge:       "#FF5C5C",   // count badge
};

interface FuzzyBagProps {
    isOpen:  boolean;
    count:   number;
    loading: boolean;
    onClick: () => void;
    width?:  number;
    height?: number;
}

export function FuzzyBag({ isOpen, count, loading, onClick, width = 260, height = 340 }: FuzzyBagProps) {
    return (
        <div
            onClick={onClick}
            style={{
                width,
                height,
                cursor: "pointer",
                userSelect: "none",
                animation: isOpen || loading
                    ? (loading ? "bagBounce 1.4s ease-in-out infinite" : "none")
                    : "bagWiggle 3s ease-in-out infinite",
            }}
        >
            <style>{`
                @keyframes bagWiggle {
                    0%,100% { transform: rotate(0deg); }
                    25%     { transform: rotate(-2.5deg); }
                    75%     { transform: rotate(2.5deg); }
                }
                @keyframes bagBounce {
                    0%,100% { transform: translateY(0); }
                    50%     { transform: translateY(-8px); }
                }
            `}</style>

            <svg
                viewBox="0 0 220 300"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                style={{ filter: "drop-shadow(5px 6px 0 #3D200860)" }}
            >
                <defs>
                    {/* Makes edges look hand-drawn / slightly wobbly */}
                    <filter id="fb-drawn" x="-4%" y="-4%" width="108%" height="108%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="4" result="n"/>
                        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.8" xChannelSelector="R" yChannelSelector="G"/>
                    </filter>
                </defs>

                {/* ── Body ── */}
                <g filter="url(#fb-drawn)">
                    <path
                        d="M 28,105 L 28,272 Q 28,283 38,283 L 182,283 Q 192,283 192,272 L 192,105 Z"
                        fill={BAG.body} stroke={BAG.outline} strokeWidth="3.5" strokeLinejoin="round"
                    />
                    {/* Depth edges */}
                    <path d="M 28,105 L 28,272 Q 28,283 38,283 L 52,283 L 52,105 Z"  fill={BAG.bodyLight} opacity="0.42"/>
                    <path d="M 192,105 L 192,272 Q 192,283 182,283 L 168,283 L 168,105 Z" fill={BAG.bodyDark}  opacity="0.32"/>
                    {/* Fold crease lines */}
                    <line x1="62"  y1="105" x2="62"  y2="283" stroke={BAG.outline} strokeWidth="1.2" opacity="0.22"/>
                    <line x1="158" y1="105" x2="158" y2="283" stroke={BAG.outline} strokeWidth="1.2" opacity="0.22"/>
                    <line x1="28"  y1="258" x2="192" y2="258" stroke={BAG.outline} strokeWidth="1.5" opacity="0.20"/>
                    {/* Sketch hatch marks on lower corners for texture */}
                    <line x1="30" y1="198" x2="52" y2="176" stroke={BAG.outline} strokeWidth="0.9" opacity="0.10"/>
                    <line x1="30" y1="216" x2="52" y2="194" stroke={BAG.outline} strokeWidth="0.9" opacity="0.10"/>
                    <line x1="168" y1="198" x2="190" y2="176" stroke={BAG.outline} strokeWidth="0.9" opacity="0.10"/>
                    <line x1="168" y1="216" x2="190" y2="194" stroke={BAG.outline} strokeWidth="0.9" opacity="0.10"/>
                </g>

                {/* ── Front label (slightly irregular path gives hand-drawn feel) ── */}
                <g filter="url(#fb-drawn)">
                    <path
                        d="M 47,130 C 50,127 170,127 173,130 C 176,133 176,225 173,227 C 170,230 50,230 47,227 C 44,225 44,133 47,130 Z"
                        fill={BAG.label} stroke={BAG.labelBorder} strokeWidth="2.2"
                    />
                    <rect x="53" y="136" width="114" height="87" rx="5"
                        fill="none" stroke={BAG.labelBorder} strokeWidth="1" strokeDasharray="5 3" opacity="0.45"
                    />
                </g>
                {/* Label text — no filter so it stays crisp */}
                <text
                    x="110" y="190" textAnchor="middle" fontSize="13.5"
                    fill={BAG.labelText} fontWeight="bold"
                    style={{ fontFamily: "'Comic Sans MS','Chalkboard SE','Comic Neue',cursive" }}
                >
                    warm fuzzies
                </text>

                {/* ── Top flap ── */}
                <g filter="url(#fb-drawn)">
                    {isOpen ? (
                        <>
                            <path
                                d="M 28,105 L 28,74 Q 28,60 40,56 L 180,56 Q 192,60 192,74 L 192,105 Z"
                                fill={BAG.flap} stroke={BAG.outline} strokeWidth="3.5" strokeLinejoin="round"
                            />
                            <line x1="28" y1="95" x2="192" y2="95" stroke={BAG.outline} strokeWidth="1.8" opacity="0.28"/>
                            <path
                                d="M 35,100 L 35,76 Q 35,64 44,61 L 176,61 Q 185,64 185,76 L 185,100 Z"
                                fill={BAG.bodyLight} opacity="0.18"
                            />
                        </>
                    ) : (
                        <>
                            <path
                                d="M 28,105 C 50,105 80,76 110,68 C 140,76 170,105 192,105 Z"
                                fill={BAG.flap} stroke={BAG.outline} strokeWidth="3.5" strokeLinejoin="round"
                            />
                            <path
                                d="M 36,103 C 58,96 85,78 110,72 C 135,78 162,96 184,103"
                                fill="none" stroke={BAG.flapCrease} strokeWidth="1.5" opacity="0.48"
                            />
                            {/* Extra sketch line on flap for texture */}
                            <path
                                d="M 50,104 C 68,98 88,84 110,79 C 132,84 152,98 170,104"
                                fill="none" stroke={BAG.flapCrease} strokeWidth="0.8" opacity="0.25"
                            />
                        </>
                    )}
                </g>

                {/* ── Count badge ── */}
                {!loading && count > 0 && !isOpen && (
                    <>
                        <circle cx="166" cy="68" r="22" fill={BAG.badge} stroke="white" strokeWidth="3"/>
                        <text x="166" y="74" textAnchor="middle" fontSize="15" fill="white" fontWeight="bold">
                            {count > 99 ? "99+" : count}
                        </text>
                    </>
                )}
            </svg>
        </div>
    );
}
