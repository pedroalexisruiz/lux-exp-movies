export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponseDTO {
  genres: Genre[];
}
