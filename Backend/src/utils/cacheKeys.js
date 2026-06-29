const cacheKeys = {
    regionData: 'region_data',
    cmsData:"cms_data",
    sliderData: (regionId, sliderType) => `slider_data_${regionId}_${sliderType}`,  
    bannerData: (bannerType) => `banner_data_${bannerType}`,
    upcomingMovieData:'upcoming_movie_data',
    membershipData:"membership_data",
    partnersData:"partners_data",
    siteSettingData:'site_setting_data',
    moviesDataByRegion:(regionId) => `region_movies_data_${regionId}`,
    moviesTodayWithShowsFromAllRegions: 'all_region_movies_today_show_data',
    recentRelaseMovieDataByRegion : (regionId) => `recent_release_region_movie_data_${regionId}`
}

export default cacheKeys;