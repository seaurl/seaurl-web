import React from 'react';
import { useNProgress } from '@tanem/react-nprogress';
const GlobalLoading = ({ isRouteChanging, }) => {
  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating: isRouteChanging,
  })

  return (
    <>
      <style jsx>{`
        .container_00 {
          opacity: ${isFinished ? 0 : 1};
          pointerevents: none;
          transition: opacity ${animationDuration}ms linear;
        }
        .bar_00 {
          background: #2BC3D5;
          height: 2px;
          left: 0;
          margin-left: ${(-1 + progress) * 100}%;
          position: fixed;
          top: 0;
          transition: margin-left ${animationDuration}ms linear;
          width: 100%;
          z-index: 1031;
        }
        .spinner_00 {
          box-shadow: 0 0 10px #2BC3D5, 0 0 5px #2BC3D5;
          display: block;
          height: 100%;
          opacity: 1;
          position: absolute;
          right: 0;
          transform: rotate(3deg) translate(0px, -4px);
          width: 100px;
        }
      `}</style>
      <div className="container_00">
        <div className="bar_00">
          <div className="spinner_00" />
        </div>
      </div>
    </>
  )
};

export default GlobalLoading;
