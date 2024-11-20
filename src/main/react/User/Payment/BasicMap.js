import React, { useEffect, useState } from "react";

export default function BasicMap({ storeLocation, storeName }) {
    const initialZoomLevel = 3;
    const [currentPosition, setCurrentPosition] = useState(null);
    const [map, setMap] = useState(null);
    const [infowindow, setInfowindow] = useState(null);
    const [marker, setMarker] = useState(null); // 마커 상태 추가

    useEffect(() => {
        if (map) return; // 지도 객체가 이미 생성되었으면 다시 생성하지 않음

        const existingScript = document.getElementById('kakao-map-sdk');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'kakao-map-sdk';
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f2ab75dd984a8c54de2057619973c70a&libraries=services,drawing,clusterer`;
            script.async = true;

            script.onload = () => {
                const mapContainer = document.getElementById('map');
                const kakaoMap = new window.kakao.maps.Map(mapContainer, {
                    center: new window.kakao.maps.LatLng(storeLocation.lat, storeLocation.lng),
                    level: initialZoomLevel,
                });
                setMap(kakaoMap); // 지도 상태 설정

                // 마커 생성
                const markerPosition = new window.kakao.maps.LatLng(storeLocation.lat, storeLocation.lng);
                const markerImage = new window.kakao.maps.MarkerImage(
                    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                    new window.kakao.maps.Size(24, 35)
                );
                const newMarker = new window.kakao.maps.Marker({
                    position: markerPosition,
                    map: kakaoMap,
                    image: markerImage,
                });
                setMarker(newMarker); // 마커 상태 설정

                // 인포윈도우 생성
                const infowindowContent = `<div style="padding:5px; font-size:12px; max-width: 150px; white-space: normal;">${storeName}</div>`;
                const newInfowindow = new window.kakao.maps.InfoWindow({
                    content: infowindowContent,
                    removable: true,
                });
                setInfowindow(newInfowindow); // 인포윈도우 상태 설정

                // 마커 클릭 시 인포윈도우 열기
                window.kakao.maps.event.addListener(newMarker, 'click', () => {
                    newInfowindow.open(kakaoMap, newMarker);
                });

                // 지도 중심을 가게 위치로 설정
                newInfowindow.open(kakaoMap, newMarker);

                // 현재 위치 가져오기
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            setCurrentPosition({ lat, lng });

                            const currentMarker = new window.kakao.maps.Marker({
                                position: new window.kakao.maps.LatLng(lat, lng),
                                map: kakaoMap,
                            });
                        },
                        (error) => {
                            console.error("현재 위치를 가져오는 데 실패했습니다.", error);
                        },
                        { enableHighAccuracy: true }
                    );
                }
            };

            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        }
    }, [storeLocation, storeName, map]); // map 상태가 없을 때만 실행

    useEffect(() => {
        if (infowindow && marker) {
            const infowindowContent = `<div style="padding:5px; font-size:12px; max-width: 150px; white-space: normal;">${storeName}</div>`;
            infowindow.setContent(infowindowContent);
            infowindow.open(map, marker);
        }
    }, [storeName, infowindow, marker, map]); // storeName이 변경될 때마다 인포윈도우 내용 갱신

    const goToCurrentPosition = () => {
        if (currentPosition && map) {
            map.setCenter(new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng));
            map.setLevel(initialZoomLevel);
        } else {
            alert("현재 위치를 가져올 수 없습니다.");
        }
    };

    const goToStoreLocation = () => {
        if (map && infowindow && marker) {
            map.setCenter(new window.kakao.maps.LatLng(storeLocation.lat, storeLocation.lng));
            map.setLevel(initialZoomLevel);

            // 기존 마커가 있으면 지도에서 제거 후 새로운 마커로 갱신
            marker.setMap(null);  // 기존 마커 제거

            const newMarker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(storeLocation.lat, storeLocation.lng),
                map: map,
                image: new window.kakao.maps.MarkerImage(
                    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                    new window.kakao.maps.Size(24, 35)
                ),
            });

            // 새로운 마커로 상태 업데이트
            setMarker(newMarker);

            // 인포윈도우 열기
            infowindow.open(map, newMarker);
        } else {
            alert("지도가 준비되지 않았습니다.");
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <div
                id="map"
                style={{ width: "100%", height: "320px", borderRadius: "10px" }}
            ></div>
            <button
                onClick={goToCurrentPosition}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    padding: "8px 10px",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    cursor: "pointer",
                    zIndex: 1,
                    fontSize: "10px",
                    color: "#000"
                }}>
                내 위치
            </button>
            <button
                onClick={goToStoreLocation}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "70px",
                    padding: "8px 10px",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    cursor: "pointer",
                    zIndex: 1,
                    fontSize: "10px",
                    color: "#000"
                }}>
                가게 위치
            </button>
        </div>
    );
}
