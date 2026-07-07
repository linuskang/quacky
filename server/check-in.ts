import { prisma } from './prisma';

interface CheckInProps {
    userId: string;
    date: Date;
    wellbeing: number;
    happiness: number;
    stress: number;
    sleep: number;
    energy: number;
    assistance: boolean;
}

export async function checkIn(
    {
        userId,
        date,
        wellbeing,
        happiness,
        stress,
        sleep,
        energy,
        assistance
    }: CheckInProps
) {
    const checkIn = await prisma.checkIn.create({
        data: {
            userId,
            date,
            wellbeing,
            happiness,
            stress,
            sleep,
            energy,
            assistance
        }
    })

    return checkIn
}

export async function hasCheckedIn(userId: string) {
    const today = new Date();

    const checkIn = await prisma.checkIn.findFirst({
        where: {
            userId,
            date: today
        }
    })

    if (!checkIn) {
        return false;
    } else {
        return true
    }
}