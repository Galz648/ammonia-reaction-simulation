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

export type State = number[] // TODO: change name - conflicts with 
// export type State = number[]; // #mrns, #proteins
export type func = (t: number, y: State) => State
export type func_extended = () => State



