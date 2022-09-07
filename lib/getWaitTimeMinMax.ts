export const getWaitTimeMinMax = (waitTime: number) => {
  const minWaitTime = waitTime + 15;
  const maxWaitTime = waitTime + 30;

  return [minWaitTime, maxWaitTime];
};
