import api from "#/lib/api";

export const login = (nickname: string, password: string) => {
  api.auth.login({
    nickname,
    password,
  });
};
