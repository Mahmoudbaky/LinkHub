"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { UILink } from "@/types";
import { incrementLinkClicks } from "@/lib/actions/link.actions";

interface FeaturedLinksSliderProps {
  sliderLinks: UILink[];
}

export function FeaturedLinksSlider({ sliderLinks }: FeaturedLinksSliderProps) {
  const handleSlideClick = async (link: UILink) => {
    try {
      // Track the click
      await incrementLinkClicks(link.id);

      // Open the link
      window.open(link.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error tracking click:", error);
      // Still open the link even if tracking fails
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  if (sliderLinks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        className="rounded-lg overflow-hidden"
        style={
          {
            "--swiper-navigation-color": "#000",
            "--swiper-navigation-size": "24px",
            "--swiper-pagination-color": "hsl(var(--primary))",
          } as React.CSSProperties
        }
      >
        {sliderLinks.map((link: UILink) => (
          <SwiperSlide key={link.id}>
            <div
              className="block relative group cursor-pointer"
              onClick={() => handleSlideClick(link)}
            >
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img
                  src={link.bannerImage || ""}
                  alt={link.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0  group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                    {link.title}
                  </h3>
                  {link.description && (
                    <p className="text-sm text-white/90 line-clamp-2">
                      {link.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
