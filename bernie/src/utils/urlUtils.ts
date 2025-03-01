export const isUrl = (str: string): boolean => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocole
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // nom de domaine
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // ou adresse IP
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port et chemin
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // chaîne de requête
        "(\\#[-a-z\\d_]*)?$", // fragment
      "i"
    );
    return pattern.test(str);
  };
  