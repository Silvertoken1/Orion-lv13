"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

export default function ClientsSay() {
  const testimonials = [
    {
      id: 1,
      quote:
        "I love how simple and straightforward the process is. I registered, invited a few friends, and started earning right away. It's a great way to earn extra income!",
      author: "Sarah Johnson",
      role: "Marketing Manager",
      location: "Abuja",
    },
    {
      id: 2,
      quote:
        "The platform exceeded my expectations! The user interface is intuitive and the support team is incredibly responsive. I've been able to grow my network effortlessly.",
      author: "Michael Chen",
      role: "Business Owner",
      location: "Kano",
    },
    {
      id: 3,
      quote:
        "What impressed me most is the transparency and reliability. Every feature works exactly as promised, and I've seen consistent results since day one. Highly recommended!",
      author: "Emily Rodriguez",
      role: "Banker",
      location: "Lagos",
    },
  ]

  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      <style jsx>{`
  @keyframes float1 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-10px) translateX(5px); }
    50% { transform: translateY(-5px) translateX(-3px); }
    75% { transform: translateY(-15px) translateX(2px); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    33% { transform: translateY(-8px) translateX(-4px); }
    66% { transform: translateY(-12px) translateX(6px); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    20% { transform: translateY(-6px) translateX(3px); }
    40% { transform: translateY(-14px) translateX(-2px); }
    60% { transform: translateY(-4px) translateX(4px); }
    80% { transform: translateY(-10px) translateX(-1px); }
  }
  @keyframes float4 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    30% { transform: translateY(-12px) translateX(-5px); }
    70% { transform: translateY(-8px) translateX(3px); }
  }
  @keyframes float5 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-7px) translateX(4px); }
    50% { transform: translateY(-13px) translateX(-3px); }
    75% { transform: translateY(-5px) translateX(2px); }
  }
  @keyframes float6 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    40% { transform: translateY(-9px) translateX(-2px); }
    80% { transform: translateY(-11px) translateX(5px); }
  }
  .animate-float-1 { animation: float1 6s ease-in-out infinite; }
  .animate-float-2 { animation: float2 8s ease-in-out infinite 1s; }
  .animate-float-3 { animation: float3 7s ease-in-out infinite 2s; }
  .animate-float-4 { animation: float4 9s ease-in-out infinite 0.5s; }
  .animate-float-5 { animation: float5 7.5s ease-in-out infinite 1.5s; }
  .animate-float-6 { animation: float6 8.5s ease-in-out infinite 3s; }
`}</style>
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-100 rounded-full opacity-30"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-pink-100 rounded-full opacity-40"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-purple-100 rounded-full opacity-30"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Floating profile images */}
        <div className="absolute top-0 right-20 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg animate-float-1">
          <Image src="/images/client-1.jpg" alt="Client" width={80} height={80} className="object-cover" />
        </div>

        <div className="absolute top-20 right-40 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg animate-float-2">
          <Image src="/images/client-2.jpg" alt="Client" width={64} height={64} className="object-cover" />
        </div>

        <div className="absolute top-32 right-10 w-24 h-24 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg animate-float-3">
          <Image src="/images/client-3.jpg" alt="Client" width={96} height={96} className="object-cover" />
        </div>

        <div className="absolute top-40 right-32 w-20 h-20 rounded-full overflow-hidden border-4 border-orange-300 shadow-lg animate-float-4">
          <Image src="/images/client-4.jpg" alt="Client" width={80} height={80} className="object-cover" />
        </div>

        <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg animate-float-5">
          <Image src="/images/client-5.jpg" alt="Client" width={112} height={112} className="object-cover" />
        </div>

        <div className="absolute bottom-40 left-20 w-24 h-24 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg animate-float-6">
          <Image src="/images/client-6.jpg" alt="Client" width={96} height={96} className="object-cover" />
        </div>

        {/* Main content */}
        <div className="max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-1 bg-blue-600"></div>
              <span className="text-blue-600 font-semibold text-lg tracking-wide">CLIENT'S SAY</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
              What Our Client Say About Us
            </h2>
          </div>

          {/* Quote section */}
          <div className="relative">
            {/* Large quotation mark */}
            <div className="text-8xl font-serif text-blue-600 opacity-80 leading-none mb-4">"</div>

            {/* Testimonial text */}
            <blockquote className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8 pl-4 transition-opacity duration-500">
              {testimonials[currentTestimonial].quote}
            </blockquote>

            {/* Author profile image */}
            <div className="flex items-center gap-4 mt-4 pl-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
                <Image
                  src={`/images/${testimonials[currentTestimonial].author.toLowerCase().replace(" ", "-")}-testimonial.jpg`}
                  alt={testimonials[currentTestimonial].author}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-lg">{testimonials[currentTestimonial].author}</div>
                <div className="text-slate-600">
                  {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                </div>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex gap-2 mt-6 pl-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentTestimonial ? "bg-blue-600" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom right arrow button */}
        <div className="absolute bottom-0 right-0">
          
        </div>
      </div>
    </section>
  )
}
