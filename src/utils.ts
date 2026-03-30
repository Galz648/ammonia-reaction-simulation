import type { ReactorStateArray } from "./simulate"



export function arrhenius_equation(activation_energy: number, temperature: number, pre_exponential_factor: number) {
    const R_KJ = 0.008314 // gas constant 
    const k = pre_exponential_factor * Math.pow(Math.E, -activation_energy / (R_KJ * temperature))
    return k
}



export function getOrThrow<T>(arr: T[], i: number): T {
    const value = arr[i]
    if (value === undefined) {
        throw new Error("Out of bounds")
    }
    return value
}

export type State = number[]
// export type State = number[]; // #mrns, #proteins
export type func = (t: number, y: State) => State
export type func_extended = () => State

export function rk4(
    f: func,
    y0: State,
    t0: number,
    dt: number,
): ReactorStateArray {

    let t = t0;
    let y = [...y0];

    const k1 = f(t, y);
    const k2 = f(t + dt / 2, y.map((yi, j) => yi + dt * getOrThrow(k1, j) / 2));
    const k3 = f(t + dt / 2, y.map((yi, j) => yi + dt * getOrThrow(k2, j) / 2));
    const k4 = f(t + dt, y.map((yi, j) => yi + dt * getOrThrow(k3, j)));

    y = y.map(
        (yi, j) =>
            yi + (dt / 6) *
            (getOrThrow(k1, j) +
                2 * getOrThrow(k2, j) +
                2 * getOrThrow(k3, j) +
                getOrThrow(k4, j))
    );

    return [...y] as ReactorStateArray;
}

