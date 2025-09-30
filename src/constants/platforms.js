// src/constants/platforms.js
import facebookIcon from "../assets/Images/facebook.png";
import instagramIcon from "../assets/Images/instagram.png";
import linkedinIcon from "../assets/Images/linkedin.png";
import pinterestIcon from "../assets/Images/pinterest.png";
import snapchatIcon from "../assets/Images/snapchat.png";
import tiktokIcon from "../assets/Images/tiktok.png";
import xIcon from "../assets/Images/x.png";
import youtubeIcon from "../assets/Images/Youtube.png";

const platforms = [
    { name: "Facebook", icon: facebookIcon, selected: true },
    { name: "Instagram", icon: instagramIcon, selected: true },
    { name: "Tiktok", icon: tiktokIcon, selected: false },
    { name: "Snapchat", icon: snapchatIcon, selected: false },
    { name: "Pinterest", icon: pinterestIcon, selected: false },
    { name: "Linkedin", icon: linkedinIcon, selected: false },
    { name: "Youtube", icon: youtubeIcon, selected: false },
    { name: "Twitter", icon: xIcon, selected: false },
];

export default platforms;
