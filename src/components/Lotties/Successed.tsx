import type { FC } from "react";

import type { AnimatedLottieViewProps } from "lottie-react-native";
import LottieView from "lottie-react-native";

import source from "@/assets/lotties/success.json";

export const LottieSuccessed: FC<Omit<AnimatedLottieViewProps, "source">> = props => <LottieView {...props} source={source}/>;
