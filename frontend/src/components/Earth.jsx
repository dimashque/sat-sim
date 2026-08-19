import {useRef} from "react";
import {useLoader} from "@react-three/fiber";
import {TextureLoader} from "three";
//A separate component for the Earth mesh
export default function Earth() {

    const meshRef = useRef();


    const texture = useLoader(TextureLoader, "/earth.jpg");
    return (
        <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}