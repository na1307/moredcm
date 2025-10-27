/**
 * 지정된 시간(초) 동안 대기하는 함수
 * @param sec 대기할 시간(초)
 */
export function sleep(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}
