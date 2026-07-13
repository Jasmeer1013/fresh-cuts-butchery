import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ChevronRight,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Printer,
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  Lock,
  LogOut,
  Settings,
  Store
} from "lucide-react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

// Menu cuts data with INR pricing
const CHICKEN_CUTS = [
  {
    id: "whole-chicken",
    name: "Whole Chicken",
    price: 220,
    unit: "kg",
    desc: "Freshly dressed whole chicken, ideal for roasting, stuffing, or custom family meals.",
    image: "/images/menu/whole-chicken.jpg"
  },
  {
    id: "curry-cut",
    name: "Curry Cut",
    price: 240,
    unit: "kg",
    desc: "Bone-in pieces, hand-cut specifically to retain succulence and absorb spices in curries.",
    image: "/images/menu/curry-cut.jpg"
  },
  {
    id: "boneless-breast",
    name: "Boneless Breast Fillet",
    price: 320,
    unit: "kg",
    desc: "Plump, premium, skinless breast fillets. Zero fat, maximum protein, perfect for grills and tikka.",
    image: "/images/menu/boneless-breast.jpg"
  },
  {
    id: "leg-piece",
    name: "Leg Drumsticks",
    price: 280,
    unit: "kg",
    desc: "Juicy, dark-meat drumsticks, ideal for Tandoori, shallow frying, or slow pot cooking.",
    image: "/images/menu/leg-piece.jpg"
  },
  {
    id: "wings",
    name: "Crispy Party Wings",
    price: 180,
    unit: "kg",
    desc: "Perfect cocktail wingettes and drumettes, cleaned and prepped for glazing or air-frying.",
    image: "/images/menu/wings.jpg"
  },
  {
    id: "liver-giblets",
    name: "Fresh Liver & Giblets",
    price: 120,
    unit: "kg",
    desc: "Nutrient-rich, fresh chicken liver and giblets, thoroughly washed and cleaned.",
    image: "/images/menu/liver-giblets.jpg"
  }
];

// High-performance image element with CSS fallback
const ChickenImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className={`bg-muted flex flex-col items-center justify-center border border-border/60 ${className} select-none`}>
        <span className="text-primary font-bold text-[10px] uppercase tracking-widest text-center px-1">
          {alt}
        </span>
        <span className="text-[9px] text-foreground/45 mt-0.5 uppercase font-bold tracking-wider">
          Fresh Cut
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

// 2D eye-tracking flat chicken fallback
const FlatChickenFallback = ({ onClick, isJumping, onJumpEnd }) => {
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      const dx = (e.clientX / window.innerWidth) * 6 - 3;
      const dy = (e.clientY / window.innerHeight) * 6 - 3;
      setEyePos({ x: dx, y: dy });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <motion.div
      onClick={onClick}
      animate={isJumping ? { y: [-18, 0], scaleY: [0.85, 1.15, 1] } : { y: 0 }}
      transition={{ duration: 0.45, type: "spring", stiffness: 220 }}
      onAnimationComplete={onJumpEnd}
      className="w-36 h-36 bg-yellow-100 rounded-full border-2 border-border shadow-md mx-auto flex flex-col items-center justify-center cursor-pointer relative"
    >
      <div className="absolute -top-3 flex space-x-0.5">
        <div className="w-3.5 h-3.5 bg-red-500 rounded-full" />
        <div className="w-4.5 h-4.5 bg-red-600 rounded-full -mt-1" />
        <div className="w-3.5 h-3.5 bg-red-500 rounded-full" />
      </div>

      <div className="flex space-x-5 relative -top-1">
        <div className="w-3.5 h-3.5 bg-white border border-border rounded-full flex items-center justify-center relative overflow-hidden">
          <div 
            className="w-1.5 h-1.5 bg-foreground rounded-full absolute"
            style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}
          />
        </div>
        <div className="w-3.5 h-3.5 bg-white border border-border rounded-full flex items-center justify-center relative overflow-hidden">
          <div 
            className="w-1.5 h-1.5 bg-foreground rounded-full absolute"
            style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}
          />
        </div>
      </div>

      <div className="w-5.5 h-4.5 bg-orange-450 rounded-b-full border-t-2 border-orange-500 mt-1" />

      <div className="absolute -left-1.5 w-3.5 h-10 bg-yellow-200 border-2 border-border rounded-full" />
      <div className="absolute -right-1.5 w-3.5 h-10 bg-yellow-200 border-2 border-border rounded-full" />

      <span className="absolute bottom-2 text-[9px] uppercase font-extrabold tracking-widest text-foreground/45">
        Tap to Hop
      </span>
    </motion.div>
  );
};

// 3D Anime Style Hen with Eye Highlight Reflections, Blinking and Wings Flutter
const CuteChicken3D = ({ mouse, isJumping, onJumpEnd }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();

  const jumpVelocity = useRef(0);
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);

  // Smooth cursor look-at point interpolation
  const smoothedLookTarget = useRef(new THREE.Vector3(0, 1.0, 3.5));

  useFrame((state, delta) => {
    // 1. Precise cursor target lock-at
    const targetX = mouse.current.x * 2.8;
    const targetY = mouse.current.y * 1.8 + 1.0;

    smoothedLookTarget.current.x = THREE.MathUtils.lerp(smoothedLookTarget.current.x, targetX, 0.1);
    smoothedLookTarget.current.y = THREE.MathUtils.lerp(smoothedLookTarget.current.y, targetY, 0.1);

    if (headRef.current) {
      headRef.current.lookAt(smoothedLookTarget.current);
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX * 0.12, 0.1);
    }

    // 2. Eye Blinking Logic
    blinkTimer.current += delta;
    if (blinkTimer.current > 3.0) {
      isBlinking.current = true;
      blinkTimer.current = 0;
    }

    if (isBlinking.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 0.05, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 0.05, 0.3);
      if (leftEyeRef.current.scale.y < 0.1) {
        isBlinking.current = false;
      }
    } else {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 1.0, 0.25);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 1.0, 0.25);
    }

    // 3. Wing wiggling / idle flapping
    const elapsed = state.clock.getElapsedTime();
    if (leftWingRef.current && rightWingRef.current) {
      if (isJumping) {
        // Fast flutter on hop
        leftWingRef.current.rotation.z = 0.15 + Math.sin(elapsed * 25) * 0.5;
        rightWingRef.current.rotation.z = -0.15 - Math.sin(elapsed * 25) * 0.5;
      } else {
        // Slow breathing sway
        leftWingRef.current.rotation.z = 0.1 + Math.sin(elapsed * 3) * 0.08;
        rightWingRef.current.rotation.z = -0.1 - Math.sin(elapsed * 3) * 0.08;
      }
    }

    // 4. Spring hop physics
    if (isJumping) {
      jumpVelocity.current += 1.6 * delta;
      groupRef.current.position.y += jumpVelocity.current;

      if (groupRef.current.position.y > 0.8) {
        groupRef.current.position.y = 0.8;
        jumpVelocity.current = -0.05;
      }
    } else {
      if (groupRef.current.position.y > 0) {
        groupRef.current.position.y = Math.max(0, groupRef.current.position.y - 4.2 * delta);
        if (groupRef.current.position.y === 0) {
          onJumpEnd();
        }
      } else {
        // Idle breathing body bob
        groupRef.current.position.y = Math.sin(elapsed * 2.5) * 0.04;
        groupRef.current.scale.y = 1 + Math.sin(elapsed * 2.5) * 0.015;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Chubby Anime Hen Body */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#FFF59D" roughness={0.4} flatShading />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.95, 0.15]}>
        <mesh castShadow>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial color="#FFF59D" roughness={0.4} flatShading />
        </mesh>

        {/* Left Anime Eye (Black base + White Shiny reflection highlight sphere) */}
        <group position={[-0.24, 0.1, 0.44]}>
          <mesh ref={leftEyeRef} castShadow>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#212121" roughness={0.1} />
          </mesh>
          {/* Highlight reflections */}
          <mesh position={[0.03, 0.03, 0.06]}>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
          </mesh>
        </group>

        {/* Right Anime Eye */}
        <group position={[0.24, 0.1, 0.44]}>
          <mesh ref={rightEyeRef} castShadow>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#212121" roughness={0.1} />
          </mesh>
          <mesh position={[0.03, 0.03, 0.06]}>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
          </mesh>
        </group>

        {/* Beak */}
        <mesh position={[0, -0.06, 0.58]} rotation={[Math.PI / 2.2, 0, 0]}>
          <coneGeometry args={[0.12, 0.28, 16]} />
          <meshStandardMaterial color="#FF9800" roughness={0.2} />
        </mesh>

        {/* Red Comb */}
        <group position={[0, 0.55, -0.05]}>
          <mesh position={[0, 0.08, 0.08]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#E53935" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.15, -0.05]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color="#E53935" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.08, -0.18]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#E53935" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Wings */}
      <mesh ref={leftWingRef} position={[-0.92, 0.05, 0]} rotation={[0, 0, 0.15]}>
        <sphereGeometry args={[0.14, 0.36, 0.22]} />
        <meshStandardMaterial color="#FFF176" roughness={0.4} flatShading />
      </mesh>
      <mesh ref={rightWingRef} position={[0.92, 0.05, 0]} rotation={[0, 0, -0.15]}>
        <sphereGeometry args={[0.14, 0.36, 0.22]} />
        <meshStandardMaterial color="#FFF176" roughness={0.4} flatShading />
      </mesh>

      {/* Feet */}
      <group position={[0, -0.85, 0]}>
        <mesh position={[-0.24, -0.08, 0.08]}>
          <boxGeometry args={[0.14, 0.16, 0.32]} />
          <meshStandardMaterial color="#FF9800" />
        </mesh>
        <mesh position={[0.24, -0.08, 0.08]}>
          <boxGeometry args={[0.14, 0.16, 0.32]} />
          <meshStandardMaterial color="#FF9800" />
        </mesh>
      </group>
    </group>
  );
};

// Canvas Wrapper with WebGL detection
const ThreeChickenWrapper = () => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isJumping, setIsJumping] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }

    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleHop = () => {
    setIsJumping(true);
  };

  if (!hasWebGL) {
    return <FlatChickenFallback onClick={handleHop} isJumping={isJumping} onJumpEnd={() => setIsJumping(false)} />;
  }

  return (
    <div 
      className="w-56 h-56 mx-auto cursor-pointer relative"
      onClick={handleHop}
    >
      <Canvas shadows camera={{ position: [0, 0.3, 3.8], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.0} castShadow />
        <CuteChicken3D mouse={mouse} isJumping={isJumping} onJumpEnd={() => setIsJumping(false)} />
      </Canvas>
      <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-foreground/45 uppercase tracking-widest font-bold pointer-events-none select-none">
        Tap to Hop • Looks at cursor
      </div>
    </div>
  );
};

// Menu Item Card Component
const MenuCard = ({ item, cartQuantity, onAddToOrder }) => {
  const [localQty, setLocalQty] = useState(0.5);

  const handleLocalIncrement = () => {
    setLocalQty((prev) => prev + 0.5);
  };

  const handleLocalDecrement = () => {
    setLocalQty((prev) => Math.max(0.5, prev - 0.5));
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
      }}
      className="bg-white border border-border rounded-2xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent/40" />

      <div>
        {/* Chicken Cut Image */}
        <div className="rounded-xl overflow-hidden mb-4 border border-border/60">
          <ChickenImage
            src={item.image}
            alt={item.name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300 animate-fade-in"
          />
        </div>

        {/* Info */}
        <div className="mb-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-foreground leading-tight">{item.name}</h3>
            <span className="text-sm font-bold text-primary whitespace-nowrap bg-muted px-2 py-0.5 rounded-lg border border-border">
              ₹{item.price}/{item.unit}
            </span>
          </div>
          <p className="text-xs text-foreground/60 leading-relaxed mt-2 font-normal">
            {item.desc}
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="space-y-3 mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground/50 font-bold uppercase tracking-wider">Select Qty</span>
          <div className="flex items-center space-x-2 bg-muted border border-border rounded-lg p-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleLocalDecrement}
              className="w-7 h-7 rounded-md bg-white hover:bg-red-50 text-foreground hover:text-destructive flex items-center justify-center cursor-pointer border border-border/50 shadow-sm transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </motion.button>
            <span className="w-14 text-center font-bold text-foreground text-sm tabular-nums">
              {localQty.toFixed(1)} {item.unit}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleLocalIncrement}
              className="w-7 h-7 rounded-md bg-white hover:bg-emerald-50 text-foreground hover:text-primary flex items-center justify-center cursor-pointer border border-border/50 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Add to order trigger */}
        <button
          onClick={() => onAddToOrder(item.id, localQty)}
          className="w-full py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-primary/95 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
        >
          <div className="w-5 h-5 rounded-md bg-white/10 overflow-hidden flex items-center justify-center border border-white/10">
            <ChickenImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <span>Add to Order</span>
        </button>

        {/* Cart status display */}
        {cartQuantity > 0 && (
          <div className="text-center text-[10px] font-bold text-accent uppercase tracking-wider animate-pulse">
            ✓ In Cart: {cartQuantity.toFixed(1)} {item.unit}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [appMode, setAppMode] = useState("customer"); // "customer" | "admin"
  const [view, setView] = useState("menu"); // "menu" | "checkout" | "ticket"
  
  // Local Database Persistence Settings
  const [orders, setOrders] = useState(() => {
    const local = localStorage.getItem("fresh_cuts_orders");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "ORD-930284",
        token: "FC-4902",
        customer: { name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@gmail.com", pickupTime: "In 15 Minutes" },
        items: [
          { id: "whole-chicken", name: "Whole Chicken", qty: 1.5, price: 220, unit: "kg", image: "/images/menu/whole-chicken.jpg" },
          { id: "curry-cut", name: "Curry Cut", qty: 2.0, price: 240, unit: "kg", image: "/images/menu/curry-cut.jpg" }
        ],
        total: 810,
        paymentStatus: "PAID (Online via Razorpay)",
        status: "Pending",
        timestamp: new Date(Date.now() - 40 * 60000).toLocaleString()
      }
    ];
  });

  const [merchantSettings, setMerchantSettings] = useState(() => {
    const local = localStorage.getItem("fresh_cuts_settings");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      shopName: "FRESH CUTS",
      shopAddress: "Downtown Market Row",
      razorpayKey: "rzp_test_hD190aI77rR0G5" // Default test key
    };
  });

  // Admin password authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminViewTab, setAdminViewTab] = useState("orders"); // "orders" | "settings"

  const [cart, setCart] = useState({});
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    pickupTime: "In 15 Minutes"
  });

  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Sync orders with Local Storage
  useEffect(() => {
    localStorage.setItem("fresh_cuts_orders", JSON.stringify(orders));
  }, [orders]);

  // Sync settings with Local Storage
  useEffect(() => {
    localStorage.setItem("fresh_cuts_settings", JSON.stringify(merchantSettings));
  }, [merchantSettings]);

  const totalPrice = CHICKEN_CUTS.reduce(
    (sum, cut) => sum + cut.price * (cart[cut.id] || 0),
    0
  );

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  // Running Total Counter
  const motionTotal = useMotionValue(0);
  const springTotal = useSpring(motionTotal, { stiffness: 100, damping: 15 });
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    motionTotal.set(totalPrice);
  }, [totalPrice]);

  useEffect(() => {
    const unsubscribe = springTotal.on("change", (latest) => {
      setDisplayTotal(latest);
    });
    return () => unsubscribe();
  }, [springTotal]);

  const handleAddToOrder = (id, quantity) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + quantity
    }));
  };

  const handleClearCart = () => {
    setCart({});
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    const isScriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!isScriptLoaded) {
      alert("Razorpay payment gateway failed to load. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    // Sanitize phone number: strip non-digits to avoid Razorpay prefill validation crashes
    const cleanPhone = customerInfo.phone.replace(/\D/g, "");

    const options = {
      key: merchantSettings.razorpayKey, // Configurable merchant Key ID
      amount: Math.round(totalPrice * 100), // convert rupees to paise
      currency: "INR",
      name: merchantSettings.shopName,
      description: "Premium Poultry Pickup Voucher",
      image: "https://cdn-icons-png.flaticon.com/512/3233/3233515.png",
      handler: function (response) {
        completeOrder(response.razorpay_payment_id, "PAID (Online via Razorpay)");
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email || "customer@freshcuts.local",
        contact: cleanPhone
      },
      theme: {
        color: "#059669"
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment Transaction Failed: " + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay error loading modal: ", err);
      alert(
        "Failed to open Razorpay Checkout: " +
          err.message +
          "\n\nPossible reasons:\n1. If using a Live Key (rzp_live_...), Razorpay requires a backend order_id. Live payments cannot run purely client-side without it.\n2. Key ID is invalid or disabled."
      );
      setIsProcessing(false);
    }
  };

  const completeOrder = (transactionId, paymentStatus) => {
    const randomToken = "FC-" + Math.floor(1000 + Math.random() * 9000);
    const randomOrder = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const activeItems = CHICKEN_CUTS.filter((cut) => cart[cut.id] > 0).map((cut) => ({
      ...cut,
      qty: cart[cut.id]
    }));

    const newOrder = {
      id: randomOrder,
      token: randomToken,
      customer: customerInfo,
      items: activeItems,
      total: totalPrice,
      paymentStatus: paymentStatus,
      status: "Pending",
      timestamp: new Date().toLocaleString()
    };

    setOrders((prev) => [newOrder, ...prev]);
    setReceipt(newOrder);
    setIsProcessing(false);
    setView("ticket");
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Please provide contact name and phone number.");
      return;
    }

    if (paymentMethod === "online") {
      handleRazorpayPayment();
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        completeOrder("CASH_ON_PICKUP_" + Date.now(), "PENDING (Pay on Pickup)");
      }, 600);
    }
  };

  const handleStartOver = () => {
    setCart({});
    setCustomerInfo({
      name: "",
      phone: "",
      email: "",
      pickupTime: "In 15 Minutes"
    });
    setView("menu");
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Password submission for Admin view access
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === "azlan1326") {
      setIsAdminAuthenticated(true);
      setAuthError("");
      setPasswordInput("");
    } else {
      setAuthError("Incorrect admin password. Please try again.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans select-none pb-24">
      {/* Header toolbar */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleStartOver}>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-playfair leading-none">
                {merchantSettings.shopName}
              </h1>
              <span className="text-[9px] uppercase font-extrabold text-accent tracking-widest block mt-0.5">
                Premium Poultry Shop
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle App View */}
            <button
              onClick={() => {
                setAppMode((prev) => (prev === "customer" ? "admin" : "customer"));
                setView("menu");
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-border flex items-center space-x-1.5 hover:bg-muted active:scale-95 transition-all cursor-pointer"
            >
              {appMode === "customer" ? (
                <>
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Admin Dashboard</span>
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <span>Back to Shop</span>
                </>
              )}
            </button>

            {appMode === "customer" && (
              <div className="px-3 py-1.5 bg-muted rounded-lg border border-border text-xs font-bold text-primary">
                {totalItems.toFixed(1)} kg selected
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 1. CUSTOMER SHOPPING EXPERIENCE */}
      {appMode === "customer" && (
        <div className="max-w-7xl mx-auto px-4 w-full mt-8">
          <AnimatePresence mode="wait">
            {view === "menu" && (
              <motion.div
                key="menu-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* 3D Interactive Chicken Banner */}
                <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden relative">
                  <div className="space-y-3 text-center md:text-left flex-1">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      <span>Anime Style 3D Hen</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black font-playfair tracking-tight text-foreground">
                      Meet Your Friendly Hen!
                    </h2>
                    <p className="text-sm text-foreground/70 max-w-xl font-medium leading-relaxed">
                      Our cute anime-style hen looks directly at you and blinks! Swipe your cursor or tap to see her head rotate. Click her to make her wing-flutter and hop.
                    </p>
                    <div className="flex items-center justify-center md:justify-start space-x-4 pt-2 text-xs font-bold text-foreground/70 uppercase">
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{merchantSettings.shopAddress}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>8 AM - 6 PM</span>
                      </span>
                    </div>
                  </div>

                  {/* 3D WebGL Canvas Chicken */}
                  <div className="w-full md:w-auto flex items-center justify-center select-none">
                    <ThreeChickenWrapper />
                  </div>
                </div>

                {/* Staggered Grid cuts cards */}
                <div className="flex justify-between items-center pb-2 border-b border-border/60">
                  <h3 className="text-lg font-bold text-foreground font-playfair uppercase tracking-wider">
                    Our Butchery Cuts
                  </h3>
                  {totalItems > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-xs font-bold text-destructive hover:underline cursor-pointer"
                    >
                      Reset Order
                    </button>
                  )}
                </div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08 }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {CHICKEN_CUTS.map((cut) => (
                    <MenuCard
                      key={cut.id}
                      item={cut}
                      cartQuantity={cart[cut.id] || 0}
                      onAddToOrder={handleAddToOrder}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {view === "checkout" && (
              <motion.div
                key="checkout-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-xl mx-auto w-full"
              >
                <button
                  onClick={() => setView("menu")}
                  className="text-xs font-bold text-foreground/50 hover:text-foreground mb-6 flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>← Back to cuts list</span>
                </button>

                <div className="bg-white border border-border rounded-2xl p-6 shadow-md space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-playfair text-foreground">Secure Checkout</h3>
                    <p className="text-xs text-foreground/60 font-semibold mt-1">
                      Enter details for counter validation at collection desk.
                    </p>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="space-y-5">
                    {/* Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-foreground/60 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-foreground/45" />
                          <input
                            type="text"
                            required
                            placeholder="Amit Verma"
                            value={customerInfo.name}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-foreground/60 uppercase tracking-wider mb-1">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-foreground/45" />
                          <input
                            type="tel"
                            required
                            placeholder="9876543210"
                            value={customerInfo.phone}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-foreground/60 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-foreground/45" />
                          <input
                            type="email"
                            placeholder="amit@gmail.com"
                            value={customerInfo.email}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-foreground/60 uppercase tracking-wider mb-1">
                          Estimated Counter Arrival
                        </label>
                        <select
                          value={customerInfo.pickupTime}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({ ...prev, pickupTime: e.target.value }))
                          }
                          className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="In 15 Minutes">In 15 Minutes</option>
                          <option value="In 30 Minutes">In 30 Minutes</option>
                          <option value="In 1 Hour">In 1 Hour</option>
                          <option value="Tomorrow Morning">Tomorrow Morning</option>
                        </select>
                      </div>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-2 pt-2">
                      <span className="block text-[10px] font-extrabold text-foreground/60 uppercase tracking-wider">
                        Payment Selection
                      </span>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("online")}
                          className={`p-3 border rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer ${
                            paymentMethod === "online"
                              ? "bg-primary/5 border-primary"
                              : "bg-muted border-border hover:bg-border/30"
                          }`}
                        >
                          <span className="font-bold text-xs text-foreground">Pay Online</span>
                          <span className="text-[9px] text-foreground/50 block mt-1 font-semibold">
                            Razorpay Gateway
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("pickup")}
                          className={`p-3 border rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer ${
                            paymentMethod === "pickup"
                              ? "bg-primary/5 border-primary"
                              : "bg-muted border-border hover:bg-border/30"
                          }`}
                        >
                          <span className="font-bold text-xs text-foreground">Pay on Pickup</span>
                          <span className="text-[9px] text-foreground/50 block mt-1 font-semibold">
                            Pay Cash/UPI at counter
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Cart list summary */}
                    <div className="bg-muted p-4 rounded-xl border border-border text-xs space-y-2 font-bold text-foreground/80">
                      <span className="block text-[9px] uppercase font-bold text-foreground/40 mb-1">
                        Cuts Checklist
                      </span>
                      {CHICKEN_CUTS.filter((cut) => cart[cut.id] > 0).map((cut) => (
                        <div key={cut.id} className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">
                            {cut.name} ({cart[cut.id].toFixed(1)} {cut.unit})
                          </span>
                          <span>₹{cut.price * cart[cut.id]}</span>
                        </div>
                      ))}
                      <div className="border-t border-border/80 pt-2 flex justify-between items-baseline">
                        <span>Total Payable (INR)</span>
                        <span className="text-lg font-black text-primary">₹{totalPrice}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-accent hover:bg-accent/95 text-white font-bold uppercase text-xs tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-2 transition-all active:scale-98"
                    >
                      {isProcessing ? (
                        <span>Validating Gateway...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            {paymentMethod === "online" ? "Pay Online Now" : "Confirm Booking"}
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {view === "ticket" && receipt && (
              <motion.div
                key="ticket-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto w-full flex flex-col items-center"
              >
                {/* Physical slide up ticket */}
                <motion.div
                  initial={{ y: 150, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="bg-white border border-border rounded-2xl w-full shadow-lg overflow-hidden flex flex-col relative"
                >
                  <div className="h-4 bg-muted/60 w-full relative flex border-b border-border/40">
                    <div
                      className="absolute top-0 left-0 right-0 h-2 bg-white"
                      style={{
                        clipPath:
                          "polygon(0 0, 2.5% 100%, 5% 0, 7.5% 100%, 10% 0, 12.5% 100%, 15% 0, 17.5% 100%, 20% 0, 22.5% 100%, 25% 0, 27.5% 100%, 30% 0, 32.5% 100%, 35% 0, 37.5% 100%, 40% 0, 42.5% 100%, 45% 0, 47.5% 100%, 50% 0, 52.5% 100%, 55% 0, 57.5% 100%, 60% 0, 62.5% 100%, 65% 0, 67.5% 100%, 70% 0, 72.5% 100%, 75% 0, 77.5% 100%, 80% 0, 82.5% 100%, 85% 0, 87.5% 100%, 90% 0, 92.5% 100%, 95% 0, 97.5% 100%, 100% 0)"
                      }}
                    />
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-primary text-[9px] font-bold rounded-full uppercase tracking-wider">
                        Order Confirmed
                      </span>
                      <h4 className="text-lg font-black text-foreground font-playfair tracking-tight mt-2 uppercase">
                        {merchantSettings.shopName}
                      </h4>
                      <span className="text-[9px] text-foreground/45 uppercase font-bold tracking-widest mt-0.5 block">
                        Collection Voucher
                      </span>
                    </div>

                    {/* Scale-in Token Reveal */}
                    <div className="bg-muted border border-border/80 rounded-xl p-4 text-center">
                      <span className="text-[9px] text-foreground/50 uppercase font-bold tracking-widest block">
                        Pickup Token
                      </span>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 180, damping: 12 }}
                        className="text-3xl font-black text-primary font-playfair tracking-widest mt-1"
                      >
                        {receipt.token}
                      </motion.div>
                    </div>

                    {/* Voucher data */}
                    <div className="border-t border-dashed border-border py-4 text-xs font-bold text-foreground/80 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-foreground/40 uppercase text-[9px]">Customer</span>
                        <span>{receipt.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/40 uppercase text-[9px]">Phone</span>
                        <span>{receipt.customer.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/40 uppercase text-[9px]">Locker Slot</span>
                        <span className="text-accent uppercase font-black">{receipt.customer.pickupTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/40 uppercase text-[9px]">Order ID</span>
                        <span>{receipt.orderId}</span>
                      </div>
                    </div>

                    {/* Products details */}
                    <div className="border-t border-dashed border-border py-4">
                      <span className="text-[9px] text-foreground/40 uppercase font-bold block mb-2">
                        Butcher breakdown
                      </span>
                      <div className="space-y-2">
                        {receipt.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs font-bold text-foreground/80">
                            <span className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-md overflow-hidden bg-muted">
                                <ChickenImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <span>
                                {item.name} ({item.qty.toFixed(1)} {item.unit})
                              </span>
                            </span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total payments */}
                    <div className="border-t border-dashed border-border pt-4 mt-2 text-xs font-bold text-foreground/80 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-foreground/40 uppercase text-[9px]">Payment Status</span>
                        <span className="text-[10px] uppercase font-bold text-primary">
                          {receipt.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-border/40">
                        <span className="text-sm font-bold text-foreground">Total Charged</span>
                        <span className="text-xl font-black text-primary font-playfair">
                          ₹{receipt.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-4 bg-muted/60 w-full relative flex border-t border-border/40">
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 bg-white"
                      style={{
                        clipPath:
                          "polygon(0 100%, 2.5% 0, 5% 100%, 7.5% 0, 10% 100%, 12.5% 0, 15% 100%, 17.5% 0, 20% 100%, 22.5% 0, 25% 100%, 27.5% 0, 30% 100%, 32.5% 0, 35% 100%, 37.5% 0, 40% 100%, 42.5% 0, 45% 100%, 47.5% 0, 50% 100%, 52.5% 0, 55% 100%, 57.5% 0, 60% 100%, 62.5% 0, 65% 100%, 67.5% 0, 70% 100%, 72.5% 0, 75% 100%, 77.5% 0, 80% 100%, 82.5% 0, 85% 100%, 87.5% 0, 90% 100%, 92.5% 0, 95% 100%, 97.5% 0, 100% 100%)"
                      }}
                    />
                  </div>
                </motion.div>

                {/* Confirm actions */}
                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 bg-white border border-border text-foreground hover:bg-muted font-bold rounded-xl shadow-sm cursor-pointer flex items-center justify-center space-x-2 transition-all active:scale-98"
                  >
                    <Printer className="w-4 h-4 text-foreground/50" />
                    <span>Print Token Voucher</span>
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/95 cursor-pointer flex items-center justify-center space-x-2 transition-all active:scale-98"
                  >
                    <span>Create New Order</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sticky Bottom Bar Drawer */}
          {view === "menu" && totalItems > 0 && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-[0_-10px_35px_rgba(0,0,0,0.08)] py-4 px-6 z-40"
            >
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest block">
                      Running Total
                    </span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-foreground font-playfair">
                        ₹{displayTotal.toFixed(0)}
                      </span>
                      <span className="text-xs text-foreground/50 font-bold">
                        ({totalItems.toFixed(1)} kg)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setView("checkout")}
                  className="px-6 py-3 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-accent/95 flex items-center space-x-2 cursor-pointer transition-all active:scale-98"
                >
                  <span>Order Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 2. ADMIN DASHBOARD & SECURITY PORTAL */}
      {appMode === "admin" && (
        <div className="max-w-7xl mx-auto px-4 w-full mt-8">
          {!isAdminAuthenticated ? (
            /* Secure Password Gate Challenge Overlay */
            <div className="max-w-md mx-auto bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-md text-center mt-12 space-y-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-playfair text-foreground">Locker Admin Verification</h3>
                <p className="text-xs text-foreground/60 font-semibold mt-1">
                  Enter password code for dispatcher access.
                </p>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter Password Code..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-center px-4 py-3 bg-muted border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                />
                {authError && (
                  <span className="text-xs text-destructive font-semibold block">{authError}</span>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-bold uppercase text-xs tracking-wider rounded-xl shadow-md cursor-pointer hover:bg-primary/95 transition-all"
                >
                  Verify Code & Enter
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard Workspace */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground font-playfair">Admin Order Desk</h2>
                  <p className="text-xs text-foreground/60 font-semibold mt-1">
                    Real-time active orders display. Updates state instantly for locker counter.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5">
                  {/* Dashboard Tab Toggles */}
                  <button
                    onClick={() => setAdminViewTab("orders")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      adminViewTab === "orders"
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Active Orders ({orders.length})
                  </button>

                  <button
                    onClick={() => setAdminViewTab("settings")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      adminViewTab === "settings"
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Config Settings</span>
                  </button>

                  <button
                    onClick={handleAdminLogout}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-destructive/20 text-destructive hover:bg-red-50 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {adminViewTab === "orders" && (
                /* Orders grid dispatcher */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-foreground/50 font-bold">
                      No active orders found in locker logs.
                    </div>
                  ) : (
                    orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Title Bar */}
                          <div className="flex justify-between items-start border-b border-border/50 pb-3">
                            <div>
                              <span className="text-xs font-extrabold text-foreground/50 tracking-wider block font-sans">
                                {ord.id}
                              </span>
                              <span className="text-xs text-foreground/40 font-bold block mt-0.5">
                                {ord.timestamp}
                              </span>
                            </div>
                            {/* Color-coded Status Badge */}
                            <span
                              className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${
                                ord.status === "Pending"
                                  ? "bg-amber-50 border-amber-200 text-amber-800"
                                  : ord.status === "Ready"
                                  ? "bg-emerald-50 border-emerald-200 text-primary"
                                  : "bg-slate-50 border-slate-200 text-slate-600"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>

                          {/* Customer Info */}
                          <div className="text-xs font-bold text-foreground/80 grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-xl border border-border/30">
                            <div>
                              <span className="text-foreground/45 uppercase text-[9px] block">Customer</span>
                              <span className="mt-0.5 block">{ord.customer.name}</span>
                            </div>
                            <div>
                              <span className="text-foreground/45 uppercase text-[9px] block">Phone</span>
                              <span className="mt-0.5 block">{ord.customer.phone}</span>
                            </div>
                            <div className="col-span-2 mt-1 pt-1 border-t border-border/20">
                              <span className="text-foreground/45 uppercase text-[9px] block">Locker Arrival Target</span>
                              <span className="text-accent uppercase font-black mt-0.5 block">
                                {ord.customer.pickupTime}
                              </span>
                            </div>
                          </div>

                          {/* Items breakdown with thumbnails */}
                          <div className="space-y-2 pt-2">
                            <span className="text-[9px] text-foreground/40 uppercase font-extrabold block">
                              Ordered Cuts
                            </span>
                            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                              {ord.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between items-center text-xs font-bold text-foreground/80"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-md overflow-hidden bg-muted border border-border/60">
                                      <ChickenImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-semibold text-foreground/90">{item.name}</span>
                                  </div>
                                  <span>
                                    {item.qty.toFixed(1)} {item.unit} (₹{item.price * item.qty})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Totals & actions */}
                        <div className="border-t border-border/50 pt-4 mt-2 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-left w-full sm:w-auto">
                            <span className="text-[9px] text-foreground/40 uppercase font-bold block">
                              Amount Payable
                            </span>
                            <span className="text-lg font-black text-primary">₹{ord.total}</span>
                            <span className="text-[9px] text-foreground/50 block font-semibold">
                              {ord.paymentStatus}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            {ord.status === "Pending" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "Ready")}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
                              >
                                Mark Ready
                              </button>
                            )}
                            {ord.status === "Ready" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "Completed")}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
                              >
                                Mark Completed
                      </button>
                            )}
                            {ord.status === "Completed" && (
                              <span className="text-[10px] font-bold text-foreground/40 uppercase py-2">
                                Order Cleared
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {adminViewTab === "settings" && (
                /* Dynamic merchant settings config panel */
                <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-sm space-y-6">
                  <div className="flex items-center space-x-2 border-b border-border pb-3">
                    <Store className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold font-playfair text-foreground">Merchant Settings</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wide mb-1.5">
                        Shop Name (Voucher Header)
                      </label>
                      <input
                        type="text"
                        value={merchantSettings.shopName}
                        onChange={(e) =>
                          setMerchantSettings((prev) => ({ ...prev, shopName: e.target.value.toUpperCase() }))
                        }
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wide mb-1.5">
                        Shop Address (Hero ribbon)
                      </label>
                      <input
                        type="text"
                        value={merchantSettings.shopAddress}
                        onChange={(e) =>
                          setMerchantSettings((prev) => ({ ...prev, shopAddress: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wide mb-1.5">
                        Razorpay Merchant Key ID
                      </label>
                      <input
                        type="text"
                        placeholder="rzp_live_... / rzp_test_..."
                        value={merchantSettings.razorpayKey}
                        onChange={(e) =>
                          setMerchantSettings((prev) => ({ ...prev, razorpayKey: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                      />
                      <span className="text-[10px] text-foreground/50 block font-semibold mt-1">
                        Pasting your live key (`rzp_live_...`) connects checkout transactions directly to your bank account securely.
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 p-4 rounded-xl text-xs font-bold leading-relaxed">
                    ✨ Keys and settings are persisted in your local browser storage. Changes will reflect instantly on checkout.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
