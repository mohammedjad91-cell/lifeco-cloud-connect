import React from 'react';
import { motion } from 'framer-motion';
import { 
  Presentation, 
  ChevronRight, 
  ChevronLeft, 
  Layout, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from '@/lib/router-compat';

const slides = [
  {
    id: 1,
    title: "نظام LIFECO الرقمي 2026",
    subtitle: "نحو رؤية متكاملة لإدارة الأصول والعمليات الإنتاجية",
    icon: <Presentation className="w-12 h-12 text-primary" />,
    points: [
      "التحول الرقمي كضرورة استراتيجية لرفع كفاءة عمليات الإنتاج في LIFECO.",
      "مواكبة التطور العالمي في إدارة المنشآت الصناعية الكبرى.",
      "ربط جميع الأقسام بنظام موحد يضمن دقة وسرعة تدفق المعلومات."
    ]
  },
  {
    id: 2,
    title: "التحديات الحالية والحلول المقترحة",
    subtitle: "تجاوز العقبات التقليدية بالتقنيات الحديثة",
    icon: <Target className="w-12 h-12 text-destructive" />,
    points: [
      "الاعتماد الكلي على السجلات الورقية وبطء تدفق المعلومات بين الأقسام.",
      "صعوبة استرجاع البيانات التاريخية للمعدات لاتخاذ قرارات الصيانة الاستباقية.",
      "أتمتة سجلات التشغيل وتقليل الأخطاء البشرية."
    ]
  },
  {
    id: 3,
    title: "آلية العمل والدورة المستندية الرقمية",
    subtitle: "من الميدان إلى الإدارة في ثوانٍ",
    icon: <Zap className="w-12 h-12 text-yellow-500" />,
    points: [
      "الربط المتكامل بين المهندسين الميدانيين وإدارة الصيانة عبر تصاريح العمل الرقمية.",
      "استخدام خرائط الـ P&ID التفاعلية لتحديد مواقع الأعطال بدقة.",
      "تحويل تصاريح العمل الورقية إلى نظام PDF مؤرشف يضمن الدورة المستندية الرسمية."
    ]
  },
  {
    id: 4,
    title: "القيمة المضافة للاستثمار",
    subtitle: "تحسين الأداء المالي والتشغيلي",
    icon: <TrendingUp className="w-12 h-12 text-green-500" />,
    points: [
      "زيادة العمر الافتراضي للمعدات عبر 'جواز السفر الرقمي' (Digital Passport).",
      "تحسين زمن الاستجابة للأعطال ورفع كفاءة استهلاك الكيماويات والموارد.",
      "توفير قاعدة بيانات تاريخية دقيقة لاتخاذ قرارات مبنية على الأرقام."
    ]
  },
  {
    id: 5,
    title: "الرؤية المستقبلية والأمان",
    subtitle: "الذكاء الاصطناعي في خدمة الصناعة",
    icon: <ShieldCheck className="w-12 h-12 text-blue-500" />,
    points: [
      "دمج الذكاء الاصطناعي لتحليل البيانات والنمذجة التشبيهية (OTS) لتدريب المهندسين الجدد.",
      "نظام صلاحيات محكم وتوثيق كامل لجميع الإجراءات لضمان أعلى معايير السلامة المهنية.",
      "تحقيق الاستدامة التشغيلية والتميز في الأداء."
    ]
  }
];

export default function PresentationSlides() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-4 md:p-8 flex flex-col font-sans rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">عرض مجلس الإدارة</h1>
            <p className="text-sm text-gray-400">LIFECO Digital Transformation 2026</p>
          </div>
        </div>
        <div className="text-sm font-mono bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">
          Slide {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 md:p-16 min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

            <div className="relative z-10">
              <div className="mb-8 flex justify-center">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
                  {slide.icon}
                </div>
              </div>
              
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-black mb-4 text-white leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl text-primary font-medium">
                  {slide.subtitle}
                </p>
              </div>

              <div className="grid gap-6 max-w-3xl mx-auto">
                {slide.points.map((point, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-start gap-4 bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-white" />
                    </div>
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                      {point}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-8 flex justify-between items-center max-w-5xl mx-auto w-full">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="outline"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 px-8 py-6 text-lg"
        >
          <ChevronRight className="w-6 h-6 ml-2" />
          السابق
        </Button>

        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-primary w-8' : 'bg-white/20'}`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="bg-primary text-white hover:bg-primary/80 px-8 py-6 text-lg"
        >
          التالي
          <ChevronLeft className="w-6 h-6 mr-2" />
        </Button>
      </div>
      
      {/* Branding Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        نظام الإدارة المتكامل © 2026 | LIFECO Digital
      </div>
    </div>
  );
}
