import prisma from "../db/db.server"
import { Md5 } from 'ts-md5';

// type User = {
//     userId: string;
//     name: string;
//     password: string;
//   };

export interface RealUser {
    userId: string;
    name: string;
    ext: Record<string, string>;
}

export interface UserResponse {
    user: RealUser | null;
    error: string | null;
}

const userByDBUser = (dbUser: any) => {
    let user: RealUser | null = null;
    if (dbUser) {
        let extMap: Record<string, string> = {};
        try {
            extMap = JSON.parse(dbUser.ext);
        } catch (e) {}
        user = {
            userId: dbUser.id,
            name: dbUser.name,
            ext: extMap,
        };
    }
    return user
}

const getUserById = async(userId: string) => {
    if (!userId) {
        return { user: null, error: '用户ID不能为空' };
    }
    const dbUser = await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });

    const user = userByDBUser(dbUser);

    return { user, error: !user ? '用户不存在' : null };
}

const getUserByName = async(name: string) => {
    const dbUser = await prisma.user.findFirst({
        where: {
            name: name,
        },
    });

    const user = userByDBUser(dbUser);

    return { user, error: !user ? '用户不存在' : null };
}

const insertDBUser = async(name: string, password: string) => {
    if (!name || !password) {
        return { user: null,error: '用户名或密码不能为空' };
    }
    const { user: existUser, error } = await getUserByName(name);
    if (existUser && !error) {
        return { user: existUser, error: '用户已存在'};
    }

    const dbUser = await prisma.user.create({
        data: {
            name: name,
            password: Md5.hashStr(password),
            ext: JSON.stringify({}),
        },
    });

    const user = userByDBUser(dbUser);

    return { user, error: !user ? '创建失败' : null };
}

const updateDBUserExt = async(userId: string, ext: Record<string, string>) => {
    if (!userId) {
        return { user: null, error: '用户ID不能为空' };
    }
    const dbUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            ext: JSON.stringify(ext),
        },
    });
    const user = userByDBUser(dbUser);

    return { user, error: !dbUser ? '更新失败' : null };
}

const validateUser = async(name: string, password: string) => {
    if (!name || !password) {
        return { user: null, error: '用户名或密码不能为空' };
    }
    const dbUser = await prisma.user.findFirst({
        where: {
            name: name,
            password: Md5.hashStr(password),
        }
    })
    const user = userByDBUser(dbUser);

    return { user, error: !dbUser ? '更新失败' : null };
}

export { getUserByName, getUserById, insertDBUser, updateDBUserExt, validateUser };
