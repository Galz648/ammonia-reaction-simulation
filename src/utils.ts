export function arrhenius_equation(activation_energy: number, temperature: number, pre_exponential_factor: number) {
    const R_KJ = 0.008314 // gas constant 
    const k = pre_exponential_factor * Math.pow(Math.E, -activation_energy / (R_KJ * temperature))
    return k
}



export function getOrThrow<T>(arr: T[], i: number): T {
    // TODO: call to this function call be replaced by a call to an object. similarly, returning a rust like Result<Ok(), Error()>
    const value = arr[i]
    if (value === undefined) {
        throw new Error("Out of bounds")
    }
    return value
}

export type State = number[] // TODO: name is semantically wrong, name should be determined after testing
export type func = (t: number, y: State) => State



