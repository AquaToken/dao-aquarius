export const truncateString = (str: string, length: number = 5): string =>
    `${str.slice(0, length)}...${str.slice(-length)}`;
