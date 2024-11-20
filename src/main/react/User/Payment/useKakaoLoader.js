import { useKakaoLoader as useKakaoLoaderOrigin } from "react-kakao-maps-sdk";

export default function useKakaoLoader() {
    useKakaoLoaderOrigin({
        appkey: "f2ab75dd984a8c54de2057619973c70a", // 본인의 appkey 사용
        libraries: ["clusterer", "drawing", "services"], // 필요한 라이브러리들 추가
    });
}
