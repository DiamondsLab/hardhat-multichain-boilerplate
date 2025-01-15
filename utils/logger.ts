import { createLogger, format, transports } from "winston";

export const createForkLogger = (forkName: string) => {
  return createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(
        ({ timestamp, level, message }) => `[${timestamp}] [${level}] ${message}`
      )
    ),
    transports: [
      new transports.File({
        filename: `./log/${forkName}-node.log`,
        level: "info",
      }),
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
    ],
  });
};
