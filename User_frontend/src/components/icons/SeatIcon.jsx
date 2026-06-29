import React, { useEffect, useRef, useState } from "react";

function SeatIcon({ open, reserved, selected,strSeatNumber,rowName, ...props }) {


useEffect(() => {
  document.querySelectorAll('svg[class^="seat-number-"]').forEach(seat => {
    seat.addEventListener('mouseenter', function() {
      // Get the seat number from the class name
      const seatNumber = this.getAttribute('class')?.match(/seat-number-([A-Z])-(\d+)/)[2];
      const rowName = this.getAttribute('class')?.match(/seat-number-([A-Z])-(\d+)/)[1];
  
      // Get the parent row (tr) of the current SVG element
      const parentRow = this.closest('tr');
  
      parentRow.querySelectorAll(`selected-seat .seat-number-${rowName}-${seatNumber}`).forEach(sameSeat => {
        sameSeat.classList.remove('hovered');
      });
      parentRow.querySelectorAll(`reserved-seat .seat-number-${rowName}-${seatNumber}`).forEach(sameSeat => {
        sameSeat.classList.remove('hovered');
      });
      
      // Find all SVG elements with the same seat number within the parent row and add a class
      parentRow.querySelectorAll(`.seat-number-${rowName}-${seatNumber}`).forEach(sameSeat => {
        sameSeat.classList.add('hovered');
      });
    });
  
    seat.addEventListener('mouseleave', function() {
      // Remove the class from all SVG elements with the same seat number within the same row
      const parentRow = this.closest('tr');
      parentRow?.querySelectorAll('.hovered').forEach(sameSeat => {
        sameSeat.classList.remove('hovered');
      });
    });
  });
},[])





 

  if (reserved) {
    
    return (
      <svg
        {...props}
        id="Group_reserved"
        data-name="Group reserved"
        xmlns="http://www.w3.org/2000/svg"
        width="37.253"
        height="32.42"
        viewBox="0 0 37.253 32.42"
        class={`reserved-seat seat-number-${rowName}-${strSeatNumber}`}
      >
        <defs>
          <linearGradient
            id="Group_reserved_linear_gradient"
            x1="0.5"
            x2="0.5"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stopColor="#919191" />
            <stop offset="1" stopColor="#6a6a6a" />
          </linearGradient>
          <linearGradient
            id="Group_reserved_linear_gradient_2"
            y1="1"
            y2="0"
            href="#Group_reserved_linear_gradient"
          />
        </defs>
        <rect
          id="Rectangle_Group_reserved"
          data-name="Rectangle Group reserved"
          width="28.319"
          height="28.319"
          rx="4"
          transform="translate(4.467)"
          fill="url(#Group_reserved_linear_gradient)"
        />
        <path
          id="Subtraction_Group_reserved"
          data-name="Subtraction Group reserved"
          d="M27.7,0H9.552A9.552,9.552,0,0,0,0,9.552v12.57H2.574V9.552A6.986,6.986,0,0,1,9.552,2.574H27.7a6.986,6.986,0,0,1,6.977,6.978v12.57h2.575V9.552A9.551,9.551,0,0,0,27.7,0Z"
          transform="translate(37.253 32.42) rotate(180)"
          fill="url(#Group_reserved_linear_gradient_2)"
        />
      </svg>
    );
  } else if (selected) {
    return (
      <svg
        {...props}
        id="Group_selected"
        data-name="Group selected"
        xmlns="http://www.w3.org/2000/svg"
        width="37.253"
        height="32.42"
        viewBox="0 0 37.253 32.42"
        class={`selected-seat seat-number-${rowName}-${strSeatNumber}`}
      >
        <defs>
          <linearGradient
            id="Group_selected_linear_gradient"
            x1="0.5"
            y1="1.26"
            x2="0.81"
            y2="-2.033"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stopColor="#eaac2f" />
            <stop offset="1" stopColor="#f3ed9a" />
          </linearGradient>
          <linearGradient
            id="Group_selected_linear_gradient_2"
            y1="-0.26"
            x2="0.19"
            y2="3.033"
            href="#Group_selected_linear_gradient"
          />
        </defs>
        <rect
          id="Rectangle_Group_selected"
          data-name="Rectangle Group selected"
          width="28.319"
          height="28.319"
          rx="4"
          transform="translate(4.467)"
          fill="url(#Group_selected_linear_gradient)"
        />
        <path
          id="Subtraction_Group_selected"
          data-name="Subtraction Group selected"
          d="M27.7,0H9.552A9.552,9.552,0,0,0,0,9.552v12.57H2.574V9.552A6.986,6.986,0,0,1,9.552,2.574H27.7a6.986,6.986,0,0,1,6.977,6.978v12.57h2.575V9.552A9.551,9.551,0,0,0,27.7,0Z"
          transform="translate(37.253 32.42) rotate(180)"
          fill="url(#Group_selected_linear_gradient_2)"
        />
      </svg>
    );
  } else if (open) {
    return (
      <svg
        {...props}
        id="Group_seat"
        data-name="Group Group seat"
        xmlns="http://www.w3.org/2000/svg"
        width="37.253"
        height="32.42"
        viewBox="0 0 37.253 32.42"
        class={`seat-number-${rowName}-${strSeatNumber}`}
      >
        <rect
          id="Rectangle_Group_seat"
          data-name="Rectangle Group seat"
          width="28.319"
          height="28.319"
          rx="4"
          transform="translate(4.467)"
          fill="#fff"
        />
        <path
          id="Subtraction_Group_seat"
          data-name="Subtraction Group seat"
          d="M27.7,0H9.552A9.552,9.552,0,0,0,0,9.552v12.57H2.574V9.552A6.986,6.986,0,0,1,9.552,2.574H27.7a6.986,6.986,0,0,1,6.977,6.978v12.57h2.575V9.552A9.551,9.551,0,0,0,27.7,0Z"
          transform="translate(37.253 32.42) rotate(180)"
          fill="#fff"
        />
      </svg>
    );
  } else {
    return <></>;
  }
}

export default SeatIcon;
