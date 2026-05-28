export type OptionItem<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type ApiOptions = {
  auth: {
    tipos_cadastro: OptionItem<"PERSONAL" | "ALUNO">[];
  };
  accounts: {
    sexos: OptionItem<"M" | "F">[];
  };
  workouts: {
    dias_semana: OptionItem[];
  };
  assessments: {
    metodos: OptionItem[];
  };
};
