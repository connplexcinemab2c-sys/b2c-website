import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import SEO from "../../../../components/common/SEO";

function About() {
  const partnerItem = [
    {
      image: PagesIndex.Jpg.partnerImg1,
    },
    {
      image: PagesIndex.Jpg.partnerImg2,
    },
    {
      image: PagesIndex.Jpg.partnerImg3,
    },
    {
      image: PagesIndex.Jpg.partnerImg4,
    },
    {
      image: PagesIndex.Jpg.partnerImg5,
    },
    {
      image: PagesIndex.Jpg.partnerImg6,
    },
    {
      image: PagesIndex.Jpg.partnerImg7,
    },
    {
      image: PagesIndex.Jpg.partnerImg8,
    },
    {
      image: PagesIndex.Jpg.partnerImg9,
    },
    {
      image: PagesIndex.Jpg.partnerImg10,
    },
    {
      image: PagesIndex.Jpg.partnerImg11,
    },
  ];
  const [cmsText, setCmsText] = useState("");
  useEffect(() => {
    getCMSData();
  }, []);
  const getCMSData = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CMS).then((res) => {
      if (res?.status === 200) {
        setCmsText(res?.data?.aboutUs);
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
  };
  return (
    <Index.Box className="main-about">
      <SEO title="About Us" />
      <PagesIndex.BannerImage
        bannerImage={PagesIndex.Jpg.aboutBanner}
        bannerImageWidth="900"
        bannerImageHeight="570"
        bannerTitle="About Connplex"
      />

      <Index.Box className="cus-container">
        <Index.Box className="about-content">
          <Index.Grid container spacing={{ lg: 5, xxs: 2 }}>
            <Index.Grid item md={6} xxs={12} className="about-content-left">
              <img
                src={PagesIndex.Jpg.Vadodara}
                width="1000"
                height="1000"
                alt="about banner"
              />
            </Index.Grid>
            <Index.Grid
              item
              md={6} xxs={12}
              className="about-content-right"
            >
              <Index.Box dangerouslySetInnerHTML={{ __html: cmsText }} />
            </Index.Grid>
          </Index.Grid>
        </Index.Box>
      </Index.Box>

      <Index.Box className="about-feature">
        <Index.Box className="cus-container">
          <Index.Box className="heading">
            <Index.Typography variant="h3" component="h3" className="title">
              WE ARE TRANSFORMING THE CINEMATIC INDUSTRY
            </Index.Typography>
          </Index.Box>
          <Index.Grid
            container
            spacing={{ lg: 5, xxs: 2 }}
            className="about-feature-box-wrapper"
          >
            <Index.Grid item md={4} xxs={12}>
              <Index.Box className="about-feature-box-border">
                <Index.Box className="about-feature-box">
                  <Index.Box className="about-feature-icon">
                    <img
                      src={PagesIndex.Png.FeatureImg1}
                      width="148"
                      height="160"
                      alt="about feature"
                    />
                  </Index.Box>
                  <Index.Box className="about-feature-bottom">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="about-feature-title"
                    >
                      Innovative Offers
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="about-feature-content"
                    >
                      Connplex Cinemas Limited is known for the Innovation & Technology, Team Connplex
                      is constantly working on various Modules to Increase Quality
                      for Viewers by offering the best Offers at Connplex.
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Grid>
            <Index.Grid item md={4} xxs={12}>
              <Index.Box className="about-feature-box-border">
                <Index.Box className="about-feature-box">
                  <Index.Box className="about-feature-icon">
                    <img
                      src={PagesIndex.Png.FeatureImg2}
                      width="148"
                      height="160"
                      alt="about feature"
                    />
                  </Index.Box>
                  <Index.Box className="about-feature-bottom">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="about-feature-title"
                    >
                      EXCELLENT TECHNOLOGY
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="about-feature-content"
                    >
                      We provide handcrafted cinematic experience to our viewers
                      by installing world class technology -at connplex our high
                      standards rises the ante up in the industry
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Grid>
            <Index.Grid item md={4} xxs={12}>
              <Index.Box className="about-feature-box-border">
                <Index.Box className="about-feature-box">
                  <Index.Box className="about-feature-icon">
                    <img
                      src={PagesIndex.Png.FeatureImg3}
                      width="148"
                      height="160"
                      alt="about feature"
                    />
                  </Index.Box>
                  <Index.Box className="about-feature-bottom">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="about-feature-title"
                    >
                      RETURN ON INVESTMENT
                    </Index.Typography>
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="about-feature-content"
                    >
                      Small investment, minimum operational cost and maximum
                      returns on investment is our slogan
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Grid>
          </Index.Grid>
        </Index.Box>
      </Index.Box>

      <Index.Box className="about-partner">
        <Index.Box className="cus-container">
          <Index.Box className="heading">
            <Index.Typography variant="h3" component="h3" className="title">
              Our Proud Partners
            </Index.Typography>
          </Index.Box>
          <Index.Box className="about-partner-slider">
            <PagesIndex.Swiper
              slidesPerView={2.8}
              spaceBetween={10}
              modules={[PagesIndex.Autoplay]}
              loop={true}
              speed={2000}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                550: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 30,
                },
              }}
            >
              {partnerItem.map((item, key) => (
                <PagesIndex.SwiperSlide key={key}>
                  <Index.Box className="partner-slider-img">
                    <img
                      src={item.image}
                      width="300"
                      height="90"
                      alt="partner"
                    />
                  </Index.Box>
                </PagesIndex.SwiperSlide>
              ))}
            </PagesIndex.Swiper>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      <PagesIndex.Membership />
    </Index.Box>
  );
}

export default About;
